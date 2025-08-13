import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LOGIN_SUCCESS, URL } from '../constants/userConstants';
import { ArrowBigLeftIcon } from 'lucide-react';

export function Register() {
  const { user, isAuthenticated, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [err, setErr] = useState();
  const [success, setSuccess] = useState();
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [otp, setOtp] = useState();

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .required('Username is required')
      .min(6, 'Must be at least 6 characters')
      .max(20, 'Must not exceed 20 characters'),
    email: Yup.string().required('Email is required').email('Invalid email'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Must be at least 6 characters')
      .max(40, 'Must not exceed 40 characters'),
    phoneNumber: Yup.string()
      .required('Phone Number is required')
      .matches(/^[0-9+-]+$/, 'Only numbers allowed')
      .min(10, 'Must be 10 characters')
      .max(10, 'Must not exceed 10 characters'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(validationSchema) });

  useEffect(() => {
    if (isAuthenticated) navigate('/');
    if (error) alert.error(error);
  }, [user, isAuthenticated, error]);

  const onSubmit = async (formData) => {
    setEmail(formData.email);
    try {
      const data = await axios.post(`${URL}/auth/register`, formData);
      if (data.data.success) {
        setSuccess(data.data.message);
        alert(data.data.message);
        navigate('/login');
      } else {
        alert(data.data.message);
        setErr(data.data.message);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Something went wrong');
      setErr(e.response?.data?.message);
    }
  };

  const handleOtp = async () => {
    try {
      const data = await axios.post(`${URL}/auth/otp`, { email, otp });
      setErr(data.data.message);
      localStorage.setItem('token', data.data.token);
      dispatch({ type: LOGIN_SUCCESS, payload: data.data.user });
      alert.success(data.data.message);
    } catch (e) {
      alert.error('Invalid OTP!');
      setErr(e.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center mb-4">
          <ArrowBigLeftIcon className="cursor-pointer mr-3" onClick={() => navigate(-1)} />
          <h2 className="text-2xl font-semibold text-gray-800">Create an Account</h2>
        </div>

        <p className="text-gray-600 mb-6">Let us know your name, email, and password</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              className={`w-full px-4 py-3 border rounded-full focus:outline-none ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Username */}
          <div>
            <input
              type="text"
              placeholder="Name"
              className={`w-full px-4 py-3 border rounded-full focus:outline-none ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('username')}
            />
            {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <input
              type="text"
              placeholder="Phone Number"
              className={`w-full px-4 py-3 border rounded-full focus:outline-none ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('phoneNumber')}
            />
            {errors.phoneNumber && <p className="text-sm text-red-500 mt-1">{errors.phoneNumber.message}</p>}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="Password"
              className={`w-full px-4 py-3 border rounded-full focus:outline-none ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('password')}
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link to="/forgot-password" className="text-blue-500 hover:underline">
            Forgot password?
          </Link>
          <br />
          <span>
            Already a user?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
              Log in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;


