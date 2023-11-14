import { useForm } from "react-hook-form";
import { Button, Input } from "../components";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
    // Backend URL for the consumer app
    const CONSUMER_URL = import.meta.env.VITE_CONSUMER_BACKEND_URL;

    // Yup validation schema for form validation
    const schema = yup.object({
        user_email: yup
            .string()
            .email("Email format is not valid")
            .required("This field is required"),
        password: yup.string().required("This field is required"),
    });

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitSuccessful, isSubmitting },
        setFocus,
    } = useForm({
        resolver: yupResolver(schema),
    });

    // Set focus on email input on page load
    useEffect(() => {
        setFocus("user_email");
    }, [setFocus]);

    // Submit handler for the form
    const submitHandler = async (data) => {
        try {
            const response = await axios.post(
                `${CONSUMER_URL}/auth/login`,
                data,
                { withCredentials: true },
            );

            const message = response.data.status;

            if (message === "success") {
                reset();
            }
        } catch (error) {
            const message = error.response.data.message;
            if (message === "No user found with this email.") {
                setError("user_email", {
                    type: "manual",
                    message: "No user found with this email",
                });
            } else if (message === "Invalid credentials.") {
                setError("password", {
                    type: "manual",
                    message: "Invalid password",
                });
            } else {
                setError("user_email", {
                    type: "manual",
                    message:
                        "Something went wrong with the request, try again later",
                });
            }
        }
    };

    // Reroute to home page after successful login
    const navigate = useNavigate();
    useEffect(() => {
        if (isSubmitSuccessful) {
            reset();
            navigate("/");
        }
    }, [isSubmitSuccessful, reset, navigate]);

    return (
        <section className="padding">
            <div className="max-container">
                <h1 className="mt-14 text-center text-5xl text-white ">
                    PostmanExpress
                </h1>
                <div className="mx-auto w-64">
                    <form
                        onSubmit={handleSubmit(submitHandler)}
                        action=""
                        className="flex flex-col items-center text-lg"
                        noValidate
                    >
                        <h2 className=" pb-5 pt-20 text-lg text-white ">
                            Customer Log In
                        </h2>
                        <Input
                            type="email"
                            placeHolder="Email"
                            register={{
                                ...register("user_email"),
                            }}
                            errorMessage={errors.user_email?.message}
                        />
                        <Input
                            type="password"
                            placeHolder="Password"
                            register={{ ...register("password") }}
                            errorMessage={errors.password?.message}
                        />

                        <Button type="submit" disabled={isSubmitting} />
                    </form>
                    <p className="mt-9 whitespace-nowrap text-lg">
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        Don't have an account yet?{" "}
                        <Link to="/signup" className="text-white">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Login;
