import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function Login() {
  const { setUserInfo } = useContext(UserContext);
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Username or Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const userRes = await fetch(`http://localhost:4000/user/${data.id}`);
        const fullUser = await userRes.json();

        setUserInfo(fullUser);
        toast.success("Login successful!");
        setStatus({ redirect: true, role: fullUser.role });
      } else {
        toast.error("Wrong credentials. Try again.");
      }
      setSubmitting(false);
    },
  });

  if (formik.status?.redirect && formik.status.role) {
  return <Navigate to={formik.status.role === "admin" ? "/admin" : "/"} />;
}


  return (
    <form className="login" onSubmit={formik.handleSubmit}>
      <h1>Login</h1>
      <input
        type="text"
        name="username"
        placeholder="Username or Email"
        onChange={formik.handleChange}
        value={formik.values.username}
      />
      {formik.touched.username && formik.errors.username && (
        <div className="error">{formik.errors.username}</div>
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

      <button type="submit" disabled={formik.isSubmitting}>Login</button>
      <div className="link-message">
        Don't have an account? <Link to="/register">Register</Link>
      </div>
    </form>
  );
} 
