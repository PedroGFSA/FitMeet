import { useAuth } from "../hooks/useAuth";

function AuthContainer({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  return (
    <>
      {isLoading && <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
      </div>}
      {!isLoading && children}
    </>
  )
}

export default AuthContainer