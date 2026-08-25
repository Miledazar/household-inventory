import { useState, type ReactNode } from "react";
import { LoadingContext } from "./LoadingContext";


export function LoadingProvider({ children }:{children:ReactNode}) {
    const [isLoading, setIsLoading] = useState(false);



    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
            {children}
       
        </LoadingContext.Provider>

    )
}