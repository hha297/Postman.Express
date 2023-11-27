import { Copyright, Facebook, Instagram, TwitterIcon } from "lucide-react";
import { Link } from "react-router-dom";

const FooterArray = [
    { icon: TwitterIcon, name: "Postman.Express Instagram" },
    { icon: Facebook, name: "Postman.Express Facebook" },
    { icon: Instagram, name: "Postman.Express Instagram" },
];

const Footer = () => {
    return (
        <footer className="padding-x">
            <div className="max-container relative flex w-full justify-between py-8">
                <div className="absolute left-1/2 top-0 w-[95%] -translate-x-1/2 border-t border-solid border-[#494844]"></div>
                <div className="">
                    {FooterArray.map((item, index) => (
                        <div
                            className="my-4 flex flex-row transition-all duration-300 hover:text-white"
                            key={index}
                        >
                            <item.icon size={20} />
                            <Link to="/" className="ml-2 text-sm">
                                {item.name}
                            </Link>
                        </div>
                    ))}
                </div>
                <div className=" flex flex-col justify-center">
                    <a
                        href="https://github.com/QuirkoTech/PostmanExpress"
                        className="mb-1 transition-all duration-300 hover:text-white"
                    >
                        {/*  eslint-disable-next-line react/no-unescaped-entities */}
                        Project's Github
                    </a>
                    <span className="flex flex-row items-center">
                        <span className="mr-1">Copyright</span>
                        <Copyright size={14} />
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
