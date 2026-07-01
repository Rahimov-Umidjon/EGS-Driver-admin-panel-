import { useEffect, useState } from "react";
import {
    RotateCcw,
} from "lucide-react";
import api from "../../api/api.ts";
import { useParams } from "react-router-dom";




import { motion } from "framer-motion";

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Button } from "@mui/material";
import UpdatePriceModal from "../../components/UpdatePriceModal/index.tsx";





interface Column {
    id: 'id' | 'service_key' | 'card_number' | 'price' | 'card_holder_name' | 'time' | 'cmr' | 'action';
    label: string;
    minWidth?: number;
    align?: 'left';
    format?: (value: number) => string;
}


const columns: readonly Column[] = [
    { id: 'id', label: 'ID', minWidth: 170 },
    { id: 'service_key', label: 'Xizmat Turlari', minWidth: 100 },
    {
        id: 'card_number',
        label: 'Karta raqami',
        minWidth: 170,
        align: 'left',
        format: (value: number) => value.toLocaleString('en-US')
    },
    {
        id: 'card_holder_name',
        label: 'FIO',
        minWidth: 170,
        align: 'left',
        format: (value: number) => value.toLocaleString('en-US')
    },
    {
        id: 'price',
        label: 'Narx',
        minWidth: 170,
        align: 'left',
        format: (value: number) => value.toLocaleString('en-US')
    },
    { id: 'action', label: "Amallar", minWidth: 170, align: 'left' },
];



export default function PricesScreen() {
    const [syncing, setSyncing] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [price, setPrice] = useState(0);
    const [currency, setCurrency] = useState<"UZS" | "USD" | "RUB" | "KZT">("UZS");
    const [cardNumber, setCardNumber] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [fio, setFio] = useState("");


    const { status: statusUrl } = useParams(); // Agar URL parametrlari kerak bo'lsa, shu yerda olish mumkin

    const handleSync = () => {
        setSyncing(true);
        void getPrices();
        setTimeout(() => setSyncing(false), 1800);
    };

    const getPrices = async () => {
        try {
            const res = await api.get(`/admin/services-pricings`);
            const responseData = res.data.service;
            console.log(responseData);
            setData(responseData);
        } catch (error) {
            console.log(error);
        }
    };

    // Sahifa o'zgarganda qayta fetch qilish
    useEffect(() => {
        void getPrices();
    }, [statusUrl]);


    const handleUpdate = async () => {
        if (selectedId === null) return; // Agar hech narsa tanlanmagan bo'lsa, hech narsa qilma
        try {
            await api.put(`/admin/service-pricings/${selectedId}`, {
                price: String(price) + ' ' + currency,
                card_number: cardNumber,
                card_holder_name: fio,

            });
            void getPrices(); // Yangilangan ma'lumotlarni qayta olish
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f4f3] p-8 font-sans">
            <div className="mx-auto">

                {/* Header */}
                <div className="flex items-start justify-between mb-7">
                    <div>
                        <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
                            Xizmat narxlari
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Xizmat narxlarini ko'rish va yangilash
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        {/* <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            <SlidersHorizontal size={14} />
                            Filters
                        </button> */}
                        <motion.button
                            onClick={handleSync}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
                        >
                            <motion.span
                                animate={syncing ? { rotate: 360 } : { rotate: 0 }}
                                transition={syncing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : {}}
                            >
                                <RotateCcw size={14} />
                            </motion.span>
                            Ma'lumotlarni yangilash
                        </motion.button>
                    </div>
                </div>



                <>
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28, duration: 0.4 }}
                        className="bg-white rounded-2xl shadow-sm overflow-hidden"
                    >


                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                            <TableContainer>
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead>
                                        <TableRow>
                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column.id}
                                                    align={column.align}
                                                // style={{minWidth: column.minWidth}}
                                                >
                                                    {column.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.map((row, index) => (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                {columns.map((column) => {
                                                    const value = row[column.id];
                                                    return (
                                                        <TableCell key={column.id} align={column.align}>
                                                            {
                                                                column.id === 'id' ? index + 1
                                                                    : column.id === 'action' ?
                                                                        <>
                                                                            <Button
                                                                                onClick={() => {
                                                                                    setPrice(row.price.split(' ')[0]);
                                                                                    setCurrency(row.price.split(' ')[1])
                                                                                    setCardNumber(row.card_number);
                                                                                    setIsOpen(true);
                                                                                    setSelectedId(row.id);
                                                                                    setFio(row.card_holder_name);
                                                                                }}
                                                                                variant={'contained'}
                                                                                color={'warning'}
                                                                                size={'small'}
                                                                            >
                                                                                Taxrirlash
                                                                            </Button>
                                                                        </>
                                                                        : value}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                        </Paper>

                    </motion.div>
                </>

            </div>

            <UpdatePriceModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={handleUpdate}
                price={price}
                setPrice={setPrice}
                currency={currency}
                setCurrency={setCurrency}
                cardNumber={cardNumber}
                fio={fio}
                setFio={setFio}
                setCardNumber={setCardNumber}
            />

        </div>
    );
}