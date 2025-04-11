import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { EyeIcon } from "lucide-react";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(email, password);
    return;
  }
  // TODO: decide whether or not to make image object-fit cover or none
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
            <p className="text-neutral-700 font-normal text-[16px]/6 pt-2 pb-5">Encontre parceiros para treinar ao ar livre.<br/>Conecte-se e comece agora! 💪</p>
            <form action="#" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="email" className="font-semibold text-neutral-700 text-[16px]/5 ">E-mail <span className="text-red-600">*</span></label>
                  <Input type="email" placeholder="Ex.: joao@email.com" value={email} className="mt-1 px-5 py-6 rounded-md placeholder:text-neutral-400 placeholder:text-[16px]/6 focus-visible:ring-0" onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="password" className="font-semibold text-neutral-700 text-[16px]/5 ">Senha <span className="text-red-600">*</span></label>
                  <div className="relative mt-1">
                    <Input type={passwordVisible ? "text" : "password"} placeholder="Ex.: joao123" value={password} className="relative px-5 py-6 rounded-md placeholder:text-neutral-400 placeholder:text-[16px]/6 focus-visible:ring-0" onChange={(e) => setPassword(e.target.value)} />
                    <i className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2 h-auto hover:cursor-pointer hover:bg-neutral-200/50 rounded-md hover:transition-all hover:duration-200" onClick={() => setPasswordVisible(!passwordVisible)}>
                      <EyeIcon className="text-neutral-400 w-6 h-6"/>
                    </i>
                  </div>
                </div>
                <button className="bg-primary-500 text-[16px]/6 font-bold text-white rounded-md px-3 py-3 mt-2" type="submit">Entrar</button>
              </div>
            </form>
            <div className="flex justify-center items-center mt-7">
              <span className="text-neutral-700 font-normal text-sm/6">Ainda não tem uma conta?<Button variant="link" className="text-neutral-700 font-bold pl-1" asChild><Link to="/register">Cadastre-se</Link></Button></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login