import {useState} from "react";

type ToastType = "success" | "error" | "info" | "warning";
interface ToastItem { id: string; type: ToastType; title: string; message: string; }


export function useToast(){


const [items,setItems]=useState<ToastItem[]>([]);



function remove(id:string){

    setItems(prev=>

        prev.filter(x=>x.id!==id)

    );

}



function add(
    type: ToastType,

    title:string,

    message:string
){


const id=
crypto.randomUUID();



setItems(prev=>[
    ...prev,
    {
        id,
        type,
        title,
        message
    }
]);



setTimeout(()=>{

    remove(id);

},4000);


}



return {


items,


remove,


toast:{


success:
(message:string)=>
add(
"success",
"Успешно",
message
),


error:
(message:string)=>
add(
"error",
"Ошибка",
message
),


info:
(message:string)=>
add(
"info",
"Информация",
message
),


warning:
(message:string)=>
add(
"warning",
"Внимание",
message
)


}


};


}
