import { CirclePlus } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useEffect, useState } from "react";
import { ActivityType } from "@/types/activityType";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useForm } from "react-hook-form";
import CustomMap from "./CustomMap";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import { CustomAlert } from "./CustomAlert";

const createActivitySchema = z.object({
  title: z.string().min(1),
  image: z.instanceof(File).refine((file) => file.size > 0, { message: 'Imagem é obrigatória' }),
  description: z.string().min(1),
  address: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  scheduledDate: z.string().min(1),
  private: z.boolean(),
  typeId: z.string().uuid(),
})

type CreateActivityData = z.infer<typeof createActivitySchema>;

interface Coordinates {
  lat: number;
  lng: number;
}

export default function CreateActivity() {
  const { register, setValue, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<CreateActivityData>({
    resolver: zodResolver(createActivitySchema),
  });

  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [createdActivityNotification, setCreatedActivityNotification] = useState<boolean>(false);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [address, setAddress] = useState<Coordinates>({ lat: 0, lng: 0 });

  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);

  navigator.geolocation.getCurrentPosition((position) => {
    setAddress({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
  }, (error) => {
    console.log(error);
    setAddress({
      lat: -10.9472,
      lng: -37.0731,
    });
  });

  useEffect(() => {
    setValue('private', isPrivate);
    setValue('typeId', selectedTypeId || '');
    setValue('address', address);
    if (image) {
      setValue('image', image);
    }
  }, [isPrivate, selectedTypeId, address, image, setValue]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/activities/types`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(data => setActivityTypes(data))
      .catch();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  function onSubmit(data: CreateActivityData) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('scheduledDate', data.scheduledDate + ':00.000Z');
    formData.append('private', data.private.toString());
    formData.append('typeId', data.typeId);
    formData.append('image', data.image);
    const parsedAddress = JSON.stringify({
      latitude: data.address.lat,
      longitude: data.address.lng
    });
    formData.append('address', parsedAddress);
    console.log(formData);
    fetch(`${import.meta.env.VITE_API_URL}/activities/new`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(() => {
        document.getElementById('close-dialog-button')?.click();
        setCreatedActivityNotification(true);
      })
      .catch(error => setError('root', { message: error.error }));
  }

  return (
    <APIProvider apiKey={import.meta.env.VITE_MAPS_API_KEY || ''} onLoad={() => console.log('Maps API has loaded.')}>
      {createdActivityNotification && <CustomAlert title="Atividade criada com sucesso" description="Sua atividade foi criada com sucesso" variant='default' success={true} timer={4000} onClose={() => setCreatedActivityNotification(false)}/> }
      <Dialog>
        <DialogTrigger asChild><Button variant="default" className="bg-primary-500 text-white rounded-sm px-3 py-5 font-bold text-sm/6 hover:cursor-pointer">
          <i><CirclePlus/></i>
          Criar atividade
        </Button></DialogTrigger>
        <DialogContent className="max-w-[784px] max-h-[850px] gap-0 pt-12 pb-0 px-12 ">
          <DialogHeader>
            <DialogTitle className="font-bebas-neue text-[2rem]/9 font-normal">Nova atividade</DialogTitle>
          </DialogHeader>
          <form action="#" onSubmit={handleSubmit(onSubmit)} className={`w-full h-auto overflow-x-auto pt-11 pb-10`}>
            <div className="w-full flex gap-12 overflow-x-auto">
              <div className={`w-1/2 flex flex-col ${errors ? 'gap-8' : 'gap-4'}`}>
                <div className="relative">
                  <label htmlFor="image" className="text-md/5 text-neutral-700 font-semibold">Imagem <span className="text-red-600">*</span></label>
                  <div className="w-full h-32 bg-white border-1 border-neutral-200 rounded-sm mt-1.5 shadow-xs flex items-center justify-center hover:cursor-pointer hover:bg-neutral-100 transition-all duration-200" onClick={() => {document.getElementById('upload-image-input')?.click()}}>
                    { preview && <img src={preview} alt="preview" className="w-full h-full object-cover rounded-sm hover:brightness-90 transition-all duration-200"/> }
                    <input {...register('image') } id="upload-image-input" type="file" className="hidden" onChange={handleImageUpload}/>
                    { !preview && <i className="w-6 h-6">
                      <img src="src/assets/images/image.svg" alt="upload-image" className="w-full h-full"/>
                    </i> }
                  </div>
                  {errors.image && <p className="text-red-600 text-sm px-1 pl-2 absolute -bottom-6">Imagem inválida</p>}
                </div>
                <div className="relative">
                  <label htmlFor="title" className="text-md/5 text-neutral-700 font-semibold">Título <span className="text-red-600">*</span></label>
                  <Input {...register('title')} type="text" placeholder="Ex.: Aula de Yoga" className="h-auto mt-1.5 px-5 py-4 placeholder:text-neutral-400 placeholder:text-[16px]/6 focus-visible:ring-0"/>
                  {errors.title && <p className="text-red-600 text-sm px-1 pl-2 absolute -bottom-6">Nome inválido</p>}
                </div>
                <div className="relative">
                  <label htmlFor="description" className="text-md/5 text-neutral-700 font-semibold">Descrição <span className="text-red-600">*</span></label>
                  <Textarea {...register('description')} placeholder="Como será a atividade? Quais as regras? O que é necessário para participar?" className="mt-1.5 resize-none min-h-27.5 px-5 pt-4 pb-5.5 text-neutral-700 font-normal placeholder:text-neutral-400 placeholder:text-[16px]/6 focus-visible:ring-0"/>
                  {errors.description && <p className="text-red-600 text-sm px-1 pl-2 absolute -bottom-6">Descrição inválida</p>}
                </div>
                <div className="relative">
                  <label htmlFor="date" className="text-md/5 text-neutral-700 font-semibold">Data <span className="text-red-600">*</span></label>
                  <Input {...register('scheduledDate')} type="datetime-local" className="text-neutral-700 font-normal mt-1.5 h-auto px-5 py-4 focus-visible:ring-0"/>
                  {errors.scheduledDate && <p className="text-red-600 text-sm px-1 pl-2  -bottom-6 z-30">Data inválida</p>}
                </div>
              </div>
              <div className="w-1/2">
                <div className={`w-full flex flex-col ${errors ? 'gap-8' : 'gap-4'}`}>
                  <div>
                    <label htmlFor="type" className="text-md/5 text-neutral-700 font-semibold">Tipo de atividade <span className="text-red-600">*</span></label>
                    <div className="mt-1.5 relative">
                      <ul className= "flex overflow-x-auto gap-2 p-[4px]" style={{ scrollbarWidth: 'initial' }}>
                        {activityTypes.map((type: ActivityType) => (
                          <li key={type.id} className="flex flex-col items-center gap-3">
                            <div className={`w-21 h-21 bg-neutral-100 flex items-center justify-center rounded-full hover:cursor-pointer  ${selectedTypeId === type.id ? 'border-2 border-white outline-2 outline-emerald-500' : ' border-2 border-white outline-2 outline-white '}`} onClick={() => setSelectedTypeId(type.id)}>
                              <img src={type.image} alt={type.name} className="w-full h-full rounded-full" />
                            </div>
                            <span className="text-neutral-900 text-md/5 font-semibold">{type.name}</span>
                          </li>
                        ))}
                      </ul>
                      {errors.typeId && <p className="text-red-600 text-sm px-1 pl-2 absolute -bottom-6">Tipo de atividade inválido</p>}
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="" className="text-md/5 text-neutral-700 font-semibold">Ponto de encontro<span className="text-red-600">*</span></label>
                    <div className="mt-1.5 h-[208px] w-full">
                      <CustomMap onCoordinatesChange={(coords: Coordinates) => {setAddress(coords); console.log(address)}} defaultCenter={address} mapId={import.meta.env.VITE_MAP_ID} />
                    </div>
                    {errors.address && <p className="text-red-600 text-sm px-1 pl-2 absolute -bottom-6">Ponto de encontro inválido</p>}
                  </div>
                  <div className="mt-1">
                    <label htmlFor="" className="text-md/5 text-neutral-700 font-semibold">Requer aprovação para participar? <span className="text-red-600">*</span></label>
                    <div className="mt-1.5 flex gap-2">
                      <Button type="button" variant="outline" className={`max-w-[77px]  h-auto max-h-11 lg:w-[77px] px-5 py-4 bg-white text-neutral-700 font-semibold rounded-md border-neutral-200 hover:cursor-pointer ${isPrivate ? 'bg-neutral-700 border-neutral-700 hover:bg-neutral-700 hover:text-white text-white' : ''}`} onClick={() => setIsPrivate(true)}> 
                        Sim
                      </Button>
                      <Button type="button" variant="outline" className={`max-w-[77px] h-auto max-h-11 lg:w-[77px] px-5 py-4 bg-white text-neutral-700 font-semibold rounded-md border-neutral-200 hover:cursor-pointer ${!isPrivate ? 'bg-neutral-700 border-neutral-700 hover:bg-neutral-700 hover:text-white text-white' : ''}`} onClick={() => setIsPrivate(false)}>
                        Não
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
          <DialogFooter className="pb-11">
            <Button type="button" onClick={handleSubmit(onSubmit)} className={`bg-primary-500 h-12 w-56 text-white rounded-[4px] font-bold text-sm/6 hover:cursor-pointer ${isSubmitting ? 'bg-neutral-500' : ''}`}>{ isSubmitting ? 'Criando...' : 'Criar' }</Button>
            {errors.root && <p className="text-red-600 text-sm px-1 pl-2">{errors.root.message}</p>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </APIProvider>
  )
}
