


interface props {
    name:string
    phone:string
}


export default function ChatNavbar({name , phone}:props) {
    return (
        <div className="h-16 w-full bg-white border-b px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div>
                    <p className="font-medium text-sm">{name}</p>
                    <p className="text-xs text-green-500">{phone}</p>
                </div>
            </div>

            {/*<button className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">*/}
            {/*    Log History*/}
            {/*</button>*/}
        </div>
    );
}