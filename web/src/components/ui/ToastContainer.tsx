import React from "react";
import {Toast} from "./Toast";


export interface ToastItem {

    id:string;

    type:
        | "success"
        | "error"
        | "info"
        | "warning";


    title:string;

    message:string;

}



interface Props {

    items:ToastItem[];

    remove:(id:string)=>void;

}



export const ToastContainer:React.FC<Props> = ({
    items,
    remove
})=>{


return (

<div className="toast-container">

{

items.map(item=>(

<Toast

    key={item.id}

    {...item}

    onClose={remove}

/>

))

}

</div>

);


};