import { CirclePlus } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

function Header() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userLevel = user?.level;
  const userAvatar = user?.avatar;

  return (
    <div className="flex justify-between items-center pt-6 pb-12 px-[110px]">
      <img src="src/assets/images/logo.png" alt="logo" className="" />
      <div className="flex items-center justify-center gap-5">
        <Button variant="default" className="bg-primary-500 text-white rounded-sm px-3 py-5 font-bold text-sm/6 hover:cursor-pointer">
          <i><CirclePlus/></i>
          Criar atividade
        </Button>
        <div className="relative">
          <Avatar  className="w-12 h-12 border-2 border-white outline-2 outline-emerald-500 ">
            <AvatarImage src={userAvatar} />
            <AvatarFallback>UK</AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-2 right-2.5 w-7 h-4.5 bg-gradient-to-b from-[#00bc7d] to-[#009966] rounded-sm z-50 text-white text-xs font-bold flex items-center justify-center">{userLevel}</span>
        </div>
      </div>
    </div>
  )
}

export default Header;
