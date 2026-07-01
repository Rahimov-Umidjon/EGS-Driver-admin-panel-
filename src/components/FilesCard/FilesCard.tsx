import {motion, AnimatePresence} from "framer-motion";
import {CheckCircle2, CreditCard, Maximize2, XCircle} from "lucide-react";
import api from "../../api/api.ts";
import {Dispatch, SetStateAction, useEffect, useState} from "react"; 
import {toast} from "react-toastify";
import { BorderQueue } from "../../interface/index.ts";

interface File {
    id: number;
    queue_id: number;
    path: string;
    type: string;
    status: "approved" | "pending" | "rejected" | string;
    created_at: string; // yoki Date
    updated_at: string; // yoki Date
}

interface FilesCardProps {
    file: File;
    actionState: 'pending' | 'pending_review' | 'waiting_payment' | 'payment_uploaded' | 'approved' | 'rejected';
    setFullscreen: (fullscreen: boolean) => void;
    setActionState: (actionState: 'pending' | 'pending_review' | 'waiting_payment' | 'payment_uploaded' | 'approved' | 'rejected') => void;
    setSelectImage: (selectImage: string) => void;
    setData: Dispatch<SetStateAction<BorderQueue | null>>;  // ← shu
}

function FilesCard({file, setFullscreen, setSelectImage, setData}: FilesCardProps) {

    const [fileStatus, setFileStatus] = useState<"approved" | "pending" | "rejected" | string>('pending');

    // console.log(file)
    // console.log(fileStatus);

    useEffect(() => {
        if (file) {
            setFileStatus(file.status);
        }
    }, [file]);


    const handleApprove = async (id: number) => {
        try {
            const res = await api.post(`/admin/file/${id}/approve`)
            console.log(res)


            setData((prev: BorderQueue | null): BorderQueue | null => {
                if (!prev) return null;
                return {
                    ...prev,
                    files: prev.files?.map((file: File) =>
                        String(file.id) === String(id)
                            ? { ...file, status: 'approved' as const }
                            : file
                    ),
                };
            });
            setFileStatus('approved')
            toast.success(res.data.message)


        } catch (error) {
            console.log(error);
        }
    };

    const handleReject = async (id: number) => {
        try {
            const res = await api.post(`/admin/file/${id}/reject`)
            console.log(res)
            setFileStatus('rejected')
            toast.success(res.data.message)
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={''}>
            {/* Screenshot Card */}
            <motion.div
                initial={{opacity: 0, y: 14}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.38}}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-[13.5px] font-semibold text-gray-700">
                        <div
                            className={` ${fileStatus === 'approved' ? 'bg-emerald-50' : fileStatus === 'rejected' ? 'bg-red-200' : 'bg-gray-100'} w-7 h-7 rounded-lg   flex items-center justify-center`}>
                            <CreditCard size={13}
                                        className={fileStatus === 'approved' ? 'text-green-500' : fileStatus === 'rejected' ? 'text-red-500' : 'text-gray-500'}/>
                        </div>
                        {
                            file.type.toUpperCase() + `  file ${fileStatus === 'approved' ? 'Tasdiqladi' : fileStatus === 'rejected' ? 'Rad etildi' : 'Tasdiqlang'}`
                        }
                    </div>
                    <button
                        onClick={() => setFullscreen(true)}
                        className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                        <Maximize2 size={12}/>
                        View Fullsize
                    </button>
                </div>
                <div className="p-4">
                    <img
                        src={`https://mobile-test.izisol.uz/storage/${file.path}`}
                        alt="Payment proof"
                        className="w-full h-[280px] object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => {
                            setSelectImage(`https://mobile-test.izisol.uz/storage/${file.path}`)
                            setFullscreen(true)
                        }}
                    />
                </div>
            </motion.div>

            <div className={'mt-6'}>
                {/* Action Buttons */}
                <AnimatePresence mode="wait">
                            <motion.div
                                key="actions"
                                initial={{opacity: 0, y: 8}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -8}}
                                transition={{delay: 0.2, duration: 0.3}}
                                className={`grid ${(fileStatus === 'pending') ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}
                            >
                                {
                                    (fileStatus === 'approved' || fileStatus === 'pending') ?
                                        <motion.button
                                            disabled={(fileStatus === 'approved')}
                                            whileHover={{scale: 1.02}}
                                            whileTap={{scale: 0.97}}
                                            onClick={() => {
                                                handleApprove(file.id)
                                            }}
                                            className={`${fileStatus === 'approved' ? 'cursor-no-drop' : ''} flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[14px] transition-colors shadow-sm`}
                                        >
                                            <CheckCircle2 size={16}/>
                                            Approve Image
                                        </motion.button>

                                        :
                                        null
                                }
                                {

                                    (fileStatus === 'rejected' || fileStatus === 'pending') ?
                                        <motion.button
                                            disabled={(fileStatus === 'rejected')}
                                            whileHover={{scale: 1.02}}
                                            whileTap={{scale: 0.97}}
                                            onClick={() => {
                                                handleReject(file.id)
                                            }}
                                            className={` ${fileStatus === 'rejected' ? 'cursor-no-drop' : ''} flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white hover:bg-red-50 text-red-500 font-semibold text-[14px] border border-red-200 transition-colors shadow-sm`}
                                        >
                                            <XCircle size={16}/>
                                            Reject Image
                                        </motion.button>
                                        :
                                        null
                                }
                            </motion.div>



                        {/*//     <motion.div*/}
                        {/*//         key="result"*/}
                        {/*//         initial={{opacity: 0, scale: 0.96}}*/}
                        {/*//         animate={{opacity: 1, scale: 1}}*/}
                        {/*//         exit={{opacity: 0}}*/}
                        {/*//         transition={{duration: 0.35}}*/}
                        {/*//         className={`flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-[14px] ${*/}
                        {/*//             actionState === "approved"*/}
                        {/*//                 ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"*/}
                        {/*//                 : "bg-red-50 text-red-700 ring-1 ring-red-200"*/}
                        {/*//         }`}*/}
                        {/*//     >*/}
                        {/*//         {actionState === "approved" ? (*/}
                        {/*//             <>*/}
                        {/*//                 <CheckCircle2 size={18}/>*/}
                        {/*//                 Payment Approved Successfully*/}
                        {/*//             </>*/}
                        {/*//         ) : (*/}
                        {/*//             <>*/}
                        {/*//                 <XCircle size={18}/>*/}
                        {/*//                 Payment Rejected*/}
                        {/*//             </>*/}
                        {/*//         )}*/}
                        {/*//     </motion.div>*/}
                        {/*// )*/}

                </AnimatePresence>
            </div>
        </div>
    );
}

export default FilesCard;