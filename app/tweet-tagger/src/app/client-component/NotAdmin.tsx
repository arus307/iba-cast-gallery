'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@mui/material';

const NotAdmin = () => {

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-2">アクセス権限がないよ！</h1>
                <p className="text-gray-700 mb-6">
                    この画面は管理者専用だから、一般ユーザーの君はアクセスできないの～💦
                    ログアウトして別のアカウントでログインしてみてね！
                </p>
                <Button
                    onClick={() => signOut()}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                    ログアウトする
                </Button>
            </div>
        </div >
    );
};

export default NotAdmin;