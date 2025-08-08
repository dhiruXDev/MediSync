 
import React, { useState } from "react";
import Swal from "sweetalert2";
const web3forms = import.meta.env.VITE_WEB3_SCHOOL_FORM;

function Contact() {
  const[loading, setLoading] =useState(false);

  const onSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();
    const formData = new FormData(event.target);

    formData.append("access_key", web3forms);

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: json,
    }).then((res) => res.json());
    console.log("Res",res)
    if (res.success) {
      Swal.fire({
        title: "Message Sent Successfully!",
        text: "We'll get back to you shortly.",
        icon: "success",
        confirmButtonColor: "#2563EB",
      });
      event.target.reset();
    } else {
      Swal.fire({
        title: "Error!",
        text: "Please try again later.",
        icon: "error",
      });
    }
    setLoading(false)
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      {/* Header */}
      <div className="text-center mb-10 mt-10">
        <h2 className="text-4xl font-bold text-blue-700">Get in Touch</h2>
        <p className="text-gray-600 mt-2 text-lg">
          We'd love to hear from you! Whether you have a question or just want to say hi 👋
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
        {/* Left Image */}
        <div>
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/contact-us-3482970-2912016.png"
            alt="Contact us illustration"
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>

        {/* Contact Form */}
        <form
                onSubmit={onSubmit}
                className="relative bg-white/30 backdrop-blur-lg p-8 shadow-2xl rounded-2xl space-y-6 border border-gray-200"
              >
                <h3 className="text-3xl font-extrabold text-blue-700 text-center">Let's Connect</h3>
                <p className="text-center text-gray-500 text-sm">Send us a message and we’ll get back to you as soon as possible.</p>

                {/* Full Name */}
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder=" "
                    required
                    className="peer w-full px-4 pt-6 pb-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="name"
                    className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all"
                  >
                    Full Name
                  </label>
                </div>

                {/* Email Address */}
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder=" "
                    required
                    className="peer w-full px-4 pt-6 pb-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all"
                  >
                    Email Address
                  </label>
                </div>

                {/* Message */}
                <div className="relative">
                  <textarea
                    name="message"
                    id="message"
                    rows="4"
                    placeholder=" "
                    required
                    className="peer w-full px-4 pt-6 pb-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  ></textarea>
                  <label
                    htmlFor="message"
                    className="absolute left-4 top-2 text-xs text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all"
                  >
                    Your Message
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className=" bg-blue-600  cursor-pointer  hover:bg-blue-700 transition-colors text-white w-full py-2  text-2xl duration-200"
                >

              {/* //w-full flex items-center justify-center gap-2  py-3 px-6 rounded-lg font-semibold tracking-wide shadow-lg */}
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
</form>

      </div>
    </div>
  );
}

export default Contact;
