import {useState} from "react";


export function useToast(){


const [items,setItems]=useState<any[]>([]);



function remove(id:string){

    setItems(prev=>

        prev.filter(x=>x.id!==id)

    );

}



function add(
    type:
    "success"|
    "error"|
    "info"|
    "warning",

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