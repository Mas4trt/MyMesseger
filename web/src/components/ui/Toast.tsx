import React from "react";
import "../../assets/css/toast.css";


export type ToastType =
    | "success"
    | "error"
    | "info"
    | "warning";


export interface ToastProps {

    id:string;

    type:ToastType;

    title:string;

    message:string;

    onClose:(id:string)=>void;

}



export const Toast:React.FC<ToastProps> = ({
    id,
    type,
    title,
    message,
    onClose
})=>{


return (

<div className={`toast toast-${type}`}>


    <div className="toast-icon">

        {
            type==="success" && "✓"
        }

        {
            type==="error" && "!"
        }

        {
            type==="warning" && "⚠"
        }

        {
            type==="info" && "i"
        }

    </div>



    <div className="toast-content">


        <div className="toast-title">

            {title}

        </div>


        <div className="toast-message">

            {message}

        </div>


    </div>



    <button
        className="toast-close"
        onClick={()=>onClose(id)}
    >

        ×

    </button>


</div>

);

};