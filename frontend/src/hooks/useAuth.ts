import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const jwtToken = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const navigate = useNavigate();

  useEffect(() => {
    if (!jwtToken) {
      navigate('/login')
    }

    const fetchUser = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      })
      const data = await response.json();
      if (!data.error) {
        setIsLoading(false)
      } else {  
        navigate('/login')
      }
    }
    fetchUser()
  })

  return { jwtToken, user, isLoading };
}

