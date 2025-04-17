import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogFooter } from "../ui/dialog";
import { DialogTrigger } from "../ui/dialog";
import { ActivityType } from "@/types/activityType";

import { Button } from "../ui/button";
import { useEffect, useState } from "react";

interface props {
  open: boolean;
  handleClose: () => void;
  handleCloseWithSuccess: () => void;
}

function PreferencesModal({ open, handleClose, handleCloseWithSuccess }: props) {
  const jwtToken = localStorage.getItem('token');
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/activities/types`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    })
      .then(response => response.json())
      .then(data => setActivityTypes(data));
  }, []);
  
  const handleSelectActivityType = (activityTypeId: string) => {
    if (selectedActivityTypes.includes(activityTypeId)) {
      setSelectedActivityTypes(prev => prev.filter(id => id !== activityTypeId));
    } else {
      setSelectedActivityTypes(prev => [...prev, activityTypeId]);
    }
  };

  const handleDefinePreferences = () => {
    console.log(JSON.stringify(selectedActivityTypes));
    fetch(`${import.meta.env.VITE_API_URL}/user/preferences/define`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(selectedActivityTypes)
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        handleCloseWithSuccess();
      }
    })
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogTrigger asChild>
          <Button variant="outline" className="hidden">Preferences</Button>
        </DialogTrigger>
        <DialogContent className="w-[528px] h-[544px] py-12 px-13">
          <DialogHeader className="">
            <DialogTitle className="font-bebas-neue text-[2rem]/9 tracking-0 font-normal flex whitespace-nowrap items-center justify-center">SELECIONE AS SUAS ATIVIDADES PREFERIDAS</DialogTitle>
          </DialogHeader>
          <ul className="grid grid-cols-4 gap-6 pt-10 pb-12">
            {activityTypes.map(activityType => (
              <li key={activityType.id} className="flex flex-col items-center justify-center">
                <div className={`w-21 h-21 rounded-full bg-neutral-100 flex items-center justify-center hover:cursor-pointer ${selectedActivityTypes.includes(activityType.id) ? 'border-2 border-white outline-2 outline-emerald-500' : 'border-2 border-white outline-2 outline-white'}`} onClick={() => handleSelectActivityType(activityType.id)}>
                  <img className="h-full w-full rounded-full" src={activityType.image} alt={activityType.name} />
                </div>
                <p className="text-neutral-900 text-md/5 font-semibold mt-3">{activityType.name}</p>
              </li>
            ))}
          </ul>
          <DialogFooter className="flex sm:justify-center gap-2">
            <Button variant="default" className="w-1/2 h-auto px-3 py-2.5 rounded-sm bg-primary-500 font-bold text-md/6 hover:cursor-pointer focus-visible:ring-0" onClick={handleDefinePreferences}>Confimar</Button>
            <Button variant="default" onClick={handleClose} className="w-1/2 h-auto px-3 py-2.75 rounded-sm bg-white border-1 border-primary-600 color-primary-600 font-bold text-md/6 hover:bg-neutral-100 hover:cursor-pointer transition-all duration-200 focus-visible:ring-0">Pular</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default PreferencesModal;

