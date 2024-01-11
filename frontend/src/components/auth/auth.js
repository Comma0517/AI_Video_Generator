import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useHistory } from 'react-router-dom';

const API_HOST = process.env.REACT_APP_BASE_URL;

const Auth = () => {
    const [mode, setMode] = useState('login');
    const [errorAlert, setErrorAlert] = useState(''); 
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const history = useHistory();  

    const toggleMode = () => {
        setMode(mode === 'login' ? 'signup' : 'login');
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleForgotPasswordClick = () => {
        
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode === 'signup' && formData.password !== formData.confirmPassword) {
            setErrorAlert("Passwords don't match!");
            return;
        }

        try {
            let dataToSend = formData;
            if (mode === 'login') {
                dataToSend = {
                    email: formData.email,
                    password: formData.password,
                };
            }

            const endpoint = mode === 'login' ? `${API_HOST}/api/scripts/login` : `${API_HOST}/api/scripts/register`;
            const response = await axios.post(endpoint, dataToSend);
            if (response.data && response.data.token) {
                Cookies.set('token', response.data.token, { expires: 1/12 });
                Cookies.set('user_id', response.data.user_id, { expires: 1/12 });
                localStorage.setItem('username', response.data.username)
                history.push('/dashboard');
            } else {
                Cookies.remove('token');
                Cookies.remove('user_id');
                localStorage.removeItem('username')
                setErrorAlert(response.data.error);
            }
        } catch (error) {
            Cookies.remove('token');
            Cookies.remove('user_id');
            localStorage.removeItem('username')
            setErrorAlert("Server Error!");
            console.error('Error during form submission', error);
        }
    };

    return (
        <section className="h-screen">
            <div className="container mx-auto h-full px-6 py-24">
                <div className="flex h-full flex-wrap items-center justify-center lg:justify-between">
                    {/* Right column with form */}
                    <div className="w-full max-w-md m-auto">
                        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                            {/* Input fields */}
                            <p className='mb-4 text-center font-bold text-blue-800 text-2xl'>{mode === 'signup' ? 'Create an account' : 'Log In'}</p>
                            {mode === 'signup' && (
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Full name"
                                        onChange={handleInputChange}
                                        value={formData.username}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                </div>
                            )}
                            <div className="mb-4">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email address"
                                    onChange={handleInputChange}
                                    value={formData.email}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-2">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    onChange={handleInputChange}
                                    value={formData.password}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            {mode === 'signup' && (
                                <div className="mb-2">
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        onChange={handleInputChange}
                                        value={formData.confirmPassword}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                        required
                                    />
                                </div>
                            )}

                            {/* Error message */}
                            {errorAlert && (
                                <div className="mb-2">
                                    <p className="text-red-500 text-sm italic">{errorAlert}</p>
                                </div>
                            )}

                            <div className="mb-6 flex items-center justify-end">
                                <a
                                    href="#!    "
                                    className="text-blue-700 text-sm font-medium"
                                    onClick={handleForgotPasswordClick}
                                >
                                    Forgot password?
                                </a>
                            </div>

                            {/* Submit button */}
                            <div className='w-full flex justify-end'>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    {mode === 'login' ? 'Log In' : 'Sign Up'}
                                </button>
                            </div>

                            {/* Toggle Mode link */}
                            <div className="mt-6 text-center">
                                <button
                                    type="button"
                                    onClick={toggleMode}
                                    className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                                >
                                    {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Auth;