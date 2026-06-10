import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api.ts";
import { User } from "lucide-react";
import { useAuth } from "../../context/AuthContext.tsx";

export interface Driver {
    id: number;
    fio: string;
    phone_number: string;
    number: string;
    additional_info: string | null;
    in_egs: number;
    is_existing_driver: boolean;
    is_online: number;
    is_verified: string; // agar enum bo‘lsa keyin toraytiramiz
    source_db: string;
    telegram_chat_id: string | null;
    last_login_at: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    sender_type: string; // masalan: 'App\\Models\\Driver'
    message: string;
    created_at: string;
    updated_at: string;
}

export interface Conversation {
    id: number;
    admin_id: number;
    driver_id: number;
    status: string; // agar enum bo‘lsa: 'open' | 'closed'
    created_at: string;
    updated_at: string;

    driver: Driver;
    messages: Message[];
}


interface UserItemProps {

    active: boolean;
    chat: Conversation,
    onClick?: () => void;
}






function Index({ children }: { children: ReactNode }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { unreadCount, setUnreadCount } = useAuth()
    const [chats, setChats] = useState<Conversation[]>()

    console.log(unreadCount)

    const fetchChatUsers = async () => {
        try {
            const res = await api.get(`/admin/chat`);
            console.log(res);
            setChats(res.data);

        } catch (e) {
            console.error(e);
        }
    }

    const readChatUsers = async (id: number) => {
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

    useEffect(() => {
        fetchChatUsers()
    }, [])


    function UserItem({ active, chat, onClick }: UserItemProps) {

        const count: number | null = unreadCount?.unread_count[chat?.id] || null

        return (
            <div
                onClick={onClick}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50 ${active && "bg-gray-100"
                    }`}
            >
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User color={'white'} />
                </div>
                <div className="flex-1 w-1/2">
                    <p style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%'
                    }} className="text-sm font-medium">{chat?.driver?.fio || 'Unknown'}</p>
                    <p style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%'
                    }} className="text-xs text-gray-500 truncate">
                        {chat?.messages[0]?.message}
                    </p>

                </div>
                {count &&
                    <div className={'w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white  '}>
                        {count}
                    </div>
                }
            </div>
        );
    }


    return (
        <div className={'w-full h-screen   grid grid-cols-4'}>

            <div className=" bg-white border-r border-gray-200 flex flex-col col-span-1 overflow-y-auto">
                <div className="p-4 font-semibold text-lg border-b h-16">
                    Broadcasts
                </div>

                <div className="p-3">
                    <input
                        type="text"
                        placeholder="Search drivers or routes..."
                        className="w-full px-3 py-2 text-sm bg-gray-100 rounded-lg outline-none"
                    />
                </div>

                <div className=" overflow-y-auto">
                    {chats &&
                        chats?.map((chat: Conversation) => (
                            <UserItem key={chat.id + chat?.driver_id}
                                onClick={() => {
                                    readChatUsers(chat.id)
                                    navigate(`/chats/${chat?.driver_id}`)

                                }}
                                chat={chat}
                                active={true}
                            />
                        ))
                    }
                </div>
            </div>
            {
                id && (<div className={'col-span-3'}>
                    {children}
                </div>)
            }


        </div>
    );
}

export default Index;