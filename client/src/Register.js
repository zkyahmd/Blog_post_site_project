import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function Register() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
 validationSchema : Yup.object({
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Must include at least one lowercase letter')
    .matches(/[A-Z]/, 'Must include at least one uppercase letter')
    .matches(/\d/, 'Must include at least one number')
    .matches(/[@$!%*?&]/, 'Must include at least one special character (@, $, !, %, *, ?, &)')
}),
    onSubmit: async (values, { setSubmitting }) => {
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        toast.success("Registration successful!");
        navigate("/login");
      } else {
        toast.error("Registration failed. Please try again.");
      }

      setSubmitting(false);
    },
  });

  return (
    <form className="register" onSubmit={formik.handleSubmit}>
      <h1>Register</h1>
      <input
        type="text"
        name="username"
        placeholder="Username"
        onChange={formik.handleChange}
        value={formik.values.username}
      />
      {formik.touched.username && formik.errors.username && (
        <div className="error">{formik.errors.username}</div>
      )}

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={formik.handleChange}
        value={formik.values.email}
      />
      {formik.touched.email && formik.errors.email && (
        <div className="error">{formik.errors.email}</div>
      )}

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={formik.handleChange}
        value={formik.values.password}
      />
      {formik.touched.password && formik.errors.password && (
        <div className="error">{formik.errors.password}</div>
      )}

      <button type="submit" disabled={formik.isSubmitting}>Register</button>
      <div className="link-message">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </form>
  );
}
