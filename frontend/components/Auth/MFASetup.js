// frontend/components/Auth/MFASetup.js
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function MFASetup() {
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        loadSetup();
    }, []);

    const loadSetup = async () => {
        const res = await api.post('/auth/mfa/setup');
        setQrCode(res.data.qrCodeUrl);
        setSecret(res.data.secret);
    };

    const verify = async () => {
        try {
            await api.post('/auth/mfa/verify', { token });
            alert('MFA Enabled!');
        } catch (err) {
            alert('Invalid Token');
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h2 className="text-xl mb-4">Setup 2FA</h2>
            <img src={qrCode} alt="QR Code" className="mb-4" />
            <p className="mb-4 font-mono select-all">{secret}</p>
            <input 
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full border p-2 mb-4"
            />
            <button onClick={verify} className="bg-blue-600 text-white px-4 py-2 rounded">
                Verify & Enable
            </button>
        </div>
    );
}