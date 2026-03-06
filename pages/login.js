import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Google sign-in removed per request.

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">🚕 FAREXO</h1>
          <p className="login-subtitle">Compare rides across Uber, Ola, Rapido & more</p>

          <div className="login-divider">
            <span>Welcome!</span>
          </div>

          {/* Google sign-in button removed */}

          <p className="login-footer">
            Sign in to access and compare ride fares
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #5BA3D0;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
        }

        .login-container {
          width: 100%;
          max-width: 400px;
        }

        .login-card {
          background: white;
          border-radius: 16px;
          padding: 40px 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .login-title {
          font-size: 32px;
          font-weight: 700;
          text-align: center;
          margin: 0 0 8px 0;
          color: #111827;
        }

        .login-subtitle {
          font-size: 14px;
          color: #6b7280;
          text-align: center;
          margin: 0 0 30px 0;
          line-height: 1.5;
        }

        .login-divider {
          display: flex;
          align-items: center;
          margin: 20px 0;
          color: #d1d5db;
          font-size: 12px;
          font-weight: 500;
        }

        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .login-divider span {
          color: #9ca3af;
          padding: 0 10px;
        }

        .login-btn {
          width: 100%;
          padding: 12px 16px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        /* Google sign-in styles removed */

        .login-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
