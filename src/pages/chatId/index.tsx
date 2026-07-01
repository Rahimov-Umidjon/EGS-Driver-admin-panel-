import {useParams} from "react-router-dom";
import ChatNavbar from "../../components/chat/chatNavbar.tsx";
import {useCallback, useEffect, useRef, useState} from "react";
import {useAuth} from "../../context/AuthContext.tsx";
import api from "../../api/api.ts";
import Pusher from "pusher-js";
import {Check, CheckCheck, Clock, MapPin, MapPinHouse, Paperclip} from "lucide-react";
import MapModal from "../../components/map/mapModal.tsx";
import ModalImage from "react-modal-image"; 


export interface Messages {
    id: number;
    message: string;
    type: "text" | "image" | "file" | "location";
    sender_id: number;
    sender_type: string;
    is_read: number; // 0 | 1
    file_url: string | null;
    latitude: number | null;
    longitude: number | null;
    created_at: string; // ISO date string
}


 


function Index() {

    const {token, user } = useAuth()
    const {id} = useParams()
    const [messages, setMessages] = useState<Messages[]>([])
    const [message, setMessage] = useState<string>('')
    const [image, setImage] = useState<File | null>(null)
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [showMap, setShowMap] = useState<boolean>(false)
    const [sendMessageLoading , setSendMessageLoading] = useState<boolean>(false)
    const [conversationsId, setConversationsId] = useState<number | null>(null)
    const [driverName , setDriverName] = useState<string>('Unknown')
    const [driverPhone , setDriverPhone] = useState<string>('')


    const userRef = useRef(user);

    console.log(userRef)


    // Barcha handlerlarni useCallback bilan o'rang
    const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value)
    }, [])

    const { setUnreadCount} = useAuth()


    const readChatUsers = async (id:number) => {
        try {
            const res = await api.post(`/admin/chat/${id}/read`);
            console.log(res);

            setUnreadCount((prev) => {
                if (!prev) return prev;

                const count = prev.unread_count[id] || 0;

                return {
                    total: prev.total - count,
                    unread_count: {
                        ...prev.unread_count,
                        [id]: 0
                    }
                };
            });
        } catch (e) {
            console.error(e);
        }
    }


    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        setImage(e.target.files?.[0] ?? null)
        const image = e.target.files?.[0] ?? null

        setSendMessageLoading(true);

        const formData = new FormData()
            if(image) {
                formData.append('image', image)
            }
            formData.append('type', 'image')
            formData.append('driver_id', id || '')


        const obj: Messages = {
            id: Date.now(),
            message: message ?? null,
            type: 'image',
            sender_id: userRef.current?.admin?.id,
            sender_type: "App\\Models\\Driver",
            is_read: -1,
            file_url: image ? URL.createObjectURL(image) : null,
            latitude:  null,
            longitude:  null,
            created_at: new Date().toISOString()
        }


        setMessages((prev) => [...prev, obj])


        try {
              await api.post(`admin/chat/send`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            setMessages((prev) =>
                prev.map((msg) =>
                    msg === obj ? { ...msg, is_read: 0 } : msg
                )
            );
            // fetchMessages()
            setMessage('')
            setLocation(null)
            setShowMap(false)
        } catch (e) {
            console.log(e);
            // ❌ Agar serverga xabar yuborilmasa, frontenddan o‘chirish
            setMessages((prev) => prev.filter((msg) => msg !== obj));
        }finally {
            setSendMessageLoading(false);
        }

    }, [])



    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {


        if(conversationsId){
            const pusher = new Pusher(`${import.meta.env.VITE_PUSHER_APP_KEY}`, {
                cluster: `${import.meta.env.VITE_PUSHER_APP_CLUSTER}`,
                authEndpoint: 'https://mobile-test.izisol.uz/api/broadcasting/auth',
                auth: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            })

            const channel = pusher.subscribe(`private-support.${conversationsId}`);
            channel.bind('support.message.sent', (data: Messages) => {


                // console.log('support.message.sent', data)
                if(String(data.sender_id) !== String(userRef.current?.admin?.id)){
                    setMessages((prev) => [...prev, data])
                }

                readChatUsers(conversationsId)
            })

            // Cleanup
            return () => {
                channel.unbind_all();
                channel.unsubscribe();
            };
        }
    }, [conversationsId]);


    const fetchMessages = useCallback(async () => {
        try {
            const res = await api.get(`admin/chat/driver/${id}`)
            console.log(res)
            setMessages(res.data.messages)
            
            setDriverName(res.data.driver.name || 'Unknown')
            setDriverPhone(res.data.driver.phone || '')
            setConversationsId(res.data.id)
        } catch (e) {
            console.log(e);
        }
    }, [id ])




    useEffect(() => {
        fetchMessages()
    }, [id])


    const sentMessages = async () => {
        if(!conversationsId)return;
        setSendMessageLoading(true);
        let type: "text" | "image" | "location" = "text"
        const formData = new FormData()
        if (image) {
            formData.append('image', image)
            type = "image"
        }
        if (message) {
            formData.append('message', message)
            type = "text"
        }
        if (location) {
            formData.append('latitude', location?.lat.toString())
            formData.append('longitude', location?.lng.toString())
            type = "location"
        }

        formData.append("type", type)
        formData.append("driver_id", String(id)  )

        const obj: Messages = {
            id: Date.now(),
            message: message ?? null,
            type: type,
            sender_id: user?.admin?.id,
            sender_type: "App\\Models\\Driver",
            is_read: -1,
            file_url: image ? URL.createObjectURL(image) : null,
            latitude: location?.lat ?? null,
            longitude: location?.lng ?? null,
            created_at: new Date().toISOString()
        }

        setMessages((prev) => [...prev, obj])    
        setShowMap(false)

        try {
              await api.post(`admin/chat/send`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            console.log(messages)

            setMessages((prev) =>
                prev.map((msg) =>
                    msg === obj ? { ...msg, is_read: 0 } : msg
                )
            );
            // fetchMessages()
            setMessage('')
            setLocation(null)
            setShowMap(false)
        } catch (e) {
            console.log(e);
            // ❌ Agar serverga xabar yuborilmasa, frontenddan o‘chirish
            setMessages((prev) => prev.filter((msg) => msg !== obj));
        }finally {
            setSendMessageLoading(false);
        }
    }


    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            // requestAnimationFrame ishlatish
            requestAnimationFrame(() => {
                containerRef.current!.scrollTop = containerRef.current!.scrollHeight;
            })
        }
    }, [messages]);


    function Data (nextDate:string , index:number) {

        const x = index !== 0 ?  new Date(messages[index-1].created_at) : new Date(nextDate)
        const y = new Date(nextDate);


        if (x.toDateString() !== y.toDateString() || index === 0) {
            return (
                <div className={'  w-max mx-auto border border-gray-200 px-2 rounded-2xl bg-gray-100'}>
                    {
                        y.getDate() + " - " + y.toDateString().split(" ")[1]
                    }
                </div>
            )
        }
    }



    function Message({data}: { data: Messages }) {
        const isSender = data?.sender_id === user?.admin?.id
        return (
            <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                <div
                    className={`max-w-md px-4 py-3 rounded-2xl text-sm ${
                        isSender
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-gray-200 text-gray-800 rounded-bl-sm"
                    }`}
                >
                    {/* Text message */}
                    {data.type === "text" && <p>{data.message}</p>}

                    {/* Image message */}
                    {data.type === "image" && data.file_url && (
                        <ModalImage
                            small={data.file_url}   // chatdagi kichik rasm
                            large={data.file_url}   // bosilganda fullscreen rasm
                            alt="image"
                            hideDownload={true}     // agar download tugmasini ko'rsatmaslik kerak bo'lsa
                            hideZoom={false}        // zoom button
                            className="rounded-lg"  // tailwind class qo‘yish mumkin
                        />
                    )}

                    {/* Location message */}
                    {data.type === "location" && data.latitude && data.longitude && (
                        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                             onClick={() => window.open(`https://www.google.com/maps?q=${data.latitude},${data.longitude}`, "_blank")}
                        >
                            <MapPin className="w-5 h-5 text-red-500" />
                            <span>Shared Location</span>
                        </div>
                    )}


                    <div className={'flex items-center justify-end mt-2 gap-1'}>

                        <p className="text-xs   opacity-70 text-right">
                            {new Date(data.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </p>

                        {
                            isSender &&  data.is_read === -1 && sendMessageLoading ? <Clock size={16} />
                                :
                                isSender && data.is_read === 1   ?
                                    <CheckCheck size={16} />
                                    :
                                    isSender && data.is_read === 0  ? <Check size={16} />
                                        : null
                        }
                    </div>
                </div>
            </div>
        );
    }



    return (
        <div className={'w-full h-screen flex  flex-col items-start justify-between border-2   cursor-pointer'}>
            <ChatNavbar name={driverName || 'Unknown'}  phone={driverPhone || ''} />
            <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-4 w-full">
                {messages &&
                    messages?.map((message: Messages, index: number) => (
                        <>
                            {message &&
                                (
                                    Data(message.created_at , index)
                                )
                            }
                            <Message key={index} data={message}/>
                        </>
                    ))
                }
            </div>
            <div className="h-20 bg-white border-t px-6 flex items-center gap-4 w-full">
                <label htmlFor={'sendFile'} className={'cursor-pointer  '}>
                    <Paperclip/>
                </label>
                <MapPinHouse onClick={()=>setShowMap(true)} />
                <input
                    id={'sendFile'}
                    type={'file'}
                    className={'hidden'}
                    onChange={handleFileChange}
                />
                <input
                    type="text"
                    placeholder="Send a one-way broadcast..."
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl outline-none"
                    onChange={handleMessageChange}
                    value={message}
                />
                <button onClick={() => sentMessages()}
                        className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                    ➤
                </button>
            </div>

            {showMap && <MapModal
                onSelect={(lat, lng) => {
                    setLocation({lat, lng});
                }}
                onClose={()=> setShowMap(false)}
                onSend = {sentMessages}
            />}
        </div>
    );
}

export default Index;