import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function AutoLogin() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const performLogin = async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({
            email: "calvarado@nebusis.com",
            password: "admin2024"
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Store session token
          if (data.sessionToken) {
            localStorage.setItem('sessionToken', data.sessionToken);
          }
          
          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        } else {
          console.error("Login failed");
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Login error:", error);
        window.location.href = "/login";
      }
    };

    performLogin();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-green-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Accessing Nebusis® ControlCore Dashboard...</p>
      </div>
    </div>
  );
}