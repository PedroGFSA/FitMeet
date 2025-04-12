import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { EyeIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type LoginData = z.infer<typeof loginSchema>;

function Login() {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } }= useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: LoginData) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/sign-in`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({...data, token: undefined}));
      navigate('/home');
    } else {
      const error = await response.json();
      setError('root', { message: error.error });
    }

  }

  return (
    <div>
      <div className="flex">
        <div className="w-1/2 h-screen p-3">
          <img className="w-full h-full rounded-md" src="src/assets/images/login-image.png" alt="login-image" /> 
        </div>
        <div className="w-1/2 flex justify-center items-center">
          <div className="w-auto max-w-md">
            <img src="src/assets/images/logo.png" alt="logo" className="w-auto h-auto mb-12" />
            <h1 className="text-[32px]/9 font-normal font-bebas-neue">BEM-VINDO DE VOLTA!</h1>
            <p className="text-neutral-700 font-normal text-[16px]/6 pt-2 pb-6">Encontre parceiros para treinar ao ar livre.<br/>Conecte-se e comece agora! 💪</p>
            <form action="#" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="email" className="font-semibold text-neutral-700 text-[16px]/5 ">E-mail <span className="text-red-600">*</span></label>
                  <Input type="text" placeholder="Ex.: joao@email.com" {...register('email')} className="mt-[6px] px-5 py-6 rounded-md placeholder:text-neutral-400 placeholder:text-[16px]/6 focus-visible:ring-0" />
                  {errors.email && <p className="text-red-600 text-sm px-1 pl-2">E-mail inválido</p>}
                </div>
                <div>
                  <label htmlFor="password" className="font-semibold text-neutral-700 text-[16px]/5 ">Senha <span className="text-red-600">*</span></label>
                  <div className="relative mt-[6px]">
                    <Input type={passwordVisible ? "text" : "password"} placeholder="Ex.: joao123" {...register('password')} className="relative pl-5 pr-12 py-6 rounded-md placeholder:text-neutral-400 placeholder:text-[16px]/6 focus-visible:ring-0" />
                    <i className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2 h-auto hover:cursor-pointer hover:bg-neutral-200/50 rounded-md hover:transition-all hover:duration-200" onClick={() => setPasswordVisible(!passwordVisible)}>
                      <EyeIcon className="text-neutral-400 w-6 h-6"/>
                    </i>
                  </div>
                  {errors.password && <p className="text-red-600 text-sm px-1 pl-2">Senha inválida</p>}
                </div>
                <div className="mt-2 flex flex-col items-center relative">
                  <button className={`${isSubmitting ? 'bg-neutral-300 text-neutral-700' : 'bg-primary-500 text-white'} text-[16px]/6 font-bold  rounded-md px-3 py-3 w-full hover:cursor-pointer hover:transition-all hover:duration-200`} type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                  </button>
                  {errors.root && <p className="text-red-600 text-sm px-1 pl-2 absolute top-12">{errors.root.message}</p>}
                </div>
              </div>
            </form>
            <div className="flex justify-center items-center mt-8">
              <span className="text-neutral-700 font-normal text-sm/6">Ainda não tem uma conta?<Button variant="link" className="text-neutral-700 font-bold pl-1" asChild><Link to="/register">Cadastre-se</Link></Button></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login