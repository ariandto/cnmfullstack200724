import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { apiurl } from './api/config';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [role, setRole] = useState(''); // New state to store the user role
    const navigate = useNavigate();

    const Auth = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${apiurl}/login`, {
                email: email,
                password: password
            });
            console.log('Response:', response.data);

            // Simpan token di localStorage
            const accessToken = response.data.accessToken;
            localStorage.setItem('accessToken', accessToken);

            // Decode token untuk mendapatkan peran pengguna
            const decodedToken = jwtDecode(accessToken);
            const userRole = decodedToken.role;
            localStorage.setItem('role', userRole);
            setRole(userRole); // Set the role in the state
            console.log('User role:', userRole);

            navigate("/home");
        } catch (error) {
            if (error.response) {
                console.error('Error response:', error.response);
                setMsg(error.response.data.msg);
            } else {
                console.error('Error message:', error.message);
                setMsg('An unexpected error occurred. Please try again.');
            }
        }
    }

    return (
        <section className="bg-gray-200 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-6">
                <div className="bg-white shadow-md rounded-lg p-8">
                    <div className="text-center mb-6">
                        <img src="cnm.png" alt="logo" className="w-24 h-24 mx-auto mb-4" />
                        <p className="text-red-500">{msg}</p>
                        {role && <p className="text-green-500">Role: {role}</p>} {/* Display the user role */}
                    </div>
                    <form onSubmit={Auth}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Email or Username</label>
                            <input
                                type="text"
                                className="w-full p-3 border rounded-lg mt-2"
                                placeholder="Username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Password</label>
                            <input
                                type="password"
                                className="w-full p-3 border rounded-lg mt-2"
                                placeholder="******"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="mt-6">
                            <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200">Login</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default Login;
