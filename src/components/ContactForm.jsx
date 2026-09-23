import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const rawText = await res.text();
      let data = {};

      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = { error: "The server returned an invalid response." };
        }
      }

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label htmlFor="contact-name">Your name</label>
      <input
        id="contact-name"
        name="name"
        type="text"
        placeholder="Your name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <label htmlFor="contact-email">Your email</label>
      <input
        id="contact-email"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <label htmlFor="contact-message">Your message</label>
      <textarea
        id="contact-message"
        name="message"
        rows="4"
        placeholder="Tell me what you are building"
        value={formData.message}
        onChange={handleChange}
        required
      />

      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Send a message"}{" "}
        <span aria-hidden="true">↗</span>
      </button>

      {status === "success" && (
        <p className="contact-form__status contact-form__status--success">
          Message sent! I'll get back to you soon.
        </p>
      )}
      {status === "error" && (
        <p className="contact-form__status contact-form__status--error">
          {errorMsg}
        </p>
      )}
    </form>
  );
}