import { Lock } from "lucide-react";
import {  formatISODateToBr } from "../../utils/functions";

interface ActivityCardProps {
  title: string;
  scheduledDate: string;
  participantCount: number;
  image: string;
  isPrivate: boolean;
}

function ActivityCard({ title, scheduledDate, participantCount, image, isPrivate }: ActivityCardProps) {
  return (
    <div className="">
      <div className="relative">
        <img className="w-full h-40 rounded-md" src={image} alt={title} />
        {isPrivate && <i className="absolute top-2 left-2 bg-gradient-to-b from-[#00bc7d] to-[#009966] rounded-full h-7 w-7 flex items-center justify-center text-white"><Lock className="w-4 h-4" /></i>}
      </div>
      <div className="flex flex-col mt-4">
        <h3 className="text-[#191919] text-[16px]/5 font-semibold tracking-normal mb-3">{title}</h3>
        <div className="flex items-center">
          <img className="w-[15px] h-[15px] mr-1.5" src="src/assets/images/calendar.svg" alt="calendar" />
          <p className="text-neutral-700 text-xs/4 font-normal">{formatISODateToBr(scheduledDate)}</p>
          <span className="text-[#707070] text-xs/4 font-normal px-3">|</span>
          <img className="w-4 h-3.5 mr-1.5" src="src/assets/images/people.svg" alt="people icon" />
          <p className="text-neutral-700 text-xs/4 font-normal">{participantCount}</p>
        </div>
      </div>
    </div>
  )
}

export default ActivityCard;
