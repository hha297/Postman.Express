import catchAsync from "../helpers/catchAsync.js";
import pool from "../db.js";
import APIError from "../../../consumer_app/server/helpers/APIError.js";
import sendEmail from "../helpers/sendEmail.js";
import checkFreeCabinets from "../helpers/checkFreeCabinets.js";
import { v4 } from "uuid";
import generateUniquePin from "../helpers/generateUniquePin.js";

export const newParcel = catchAsync(async (req, res, next) => {
    const {
        parcel_name,
        recipient_email,
        weight,
        height,
        width,
        length,
        ship_to,
        ship_from,
    } = req.body;

    if (ship_from === ship_to)
        return next(
            new APIError("You can't send parcels to the same location.", 400),
        );

    let status = "awaiting drop-off";

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const freeCabinets = await checkFreeCabinets(req.user.user_location);

        if (!freeCabinets) {
            await client.query("ROLLBACK");
            client.release();

            return next(
                new APIError("No available cabinets at the moment.", 404),
            );
        }

        const delivery_pin = await generateUniquePin("delivery");
        const parcel_id = v4();

        await client.query(
            "INSERT INTO parcels (ship_from, ship_to, parcel_id, parcel_name, parcel_status, parcel_sender_id, parcel_receiver_email, height, length, width, weight, delivery_pin, status_timestamps, notify) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, ARRAY[jsonb_build_object('date', TO_CHAR( now(), 'DD.MM.YY'), 'time', TO_CHAR(now(), 'HH24:MI'), 'status', 'awaiting drop-off')], $13) RETURNING *",
            [
                ship_from,
                ship_to,
                parcel_id,
                parcel_name,
                status,
                req.user.user_id,
                recipient_email,
                height,
                length,
                width,
                weight,
                delivery_pin,
                false,
            ],
        );

        await client.query(
            "WITH selected_cabinet AS \
             (SELECT \
                cabinet_id FROM cabinets \
                WHERE \
                cabinet_location = $1 AND cabinet_status = 'empty' \
                LIMIT 1 ) \
             UPDATE \
             cabinets \
                SET \
                cabinet_status = 'reserved' \
                FROM selected_cabinet \
                WHERE \
                cabinets.cabinet_id = selected_cabinet.cabinet_id",
            [req.user.user_location],
        );

        const emailSent = await sendEmail(
            req.user.user_email,
            "Parcel awaiting drop-off",
            { ...req.body, parcel_id, pin: delivery_pin },
            "consumer",
            ship_from,
        );

        if (!emailSent) {
            await client.query("ROLLBACK");
            client.release();
            return next(new APIError("Couldn't send an email.", 500));
        }

        await client.query("COMMIT");
        client.release();
        res.status(201).json({
            status: "success",
            data: {
                message:
                    "Parcel created. Check your email for further instructions.",
            },
        });
    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error("Parcel creation rollback failed: ", rollbackError);
        }

        console.log(error);

        client.release();
        return next(
            new APIError("Couldn't create new parcel, try again later.", 500),
        );
    }
});
