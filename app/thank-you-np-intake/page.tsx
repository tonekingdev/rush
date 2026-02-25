import Link from "next/link"



const ThankYouNpIntakePage = () => {
    return (
        <div className="max-w-md mx-auto mt-10 text-center">
            <h1 className="text-2xl font-bold mb-5">
                Thank You!
            </h1>
            <p className="mb-5">Your intake has been submitted successfully. We appreciate your in interest in R.U.S.H. Platform.</p>

            <div className="space-y-3">
                <Link
                    href="https://rushhealthc.com"
                    className="block w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-medium"
                >
                    Return to R.U.S.H. Platform
                </Link>

                <p className="text-sm text-gray-500">
                    Questions? Contact us at{" "}
                    <a href="mailto:info@rushhealthc.com" className="text-blue-500 hover:underline">
                    info@rushhealthc.com
                    </a>{" "}
                    or{" "}
                    <a href="tel:586-344-4567" className="text-blue-500 hover:underline">
                    (586) 344-4567
                    </a>
                </p>
            </div>
        </div>
    )
}

export default ThankYouNpIntakePage