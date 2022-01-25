import React, { createContext, useLayoutEffect, useRef, useState } from "react";

export const EditorContext = createContext({
	mouseUpHandler : () => {},
	keyUpHandler : () => {},
	selectionHandler : () => {},
	activeSession : 0 , 
	setActiveSessionHandler : (id = 0, handlerObject = {}) => {},
})

const TextEditorProvider = ({ children }) => {

	const [activeSession , setActiveSession] = useState(null)

	const handlersRef = useRef({});
	

	useLayoutEffect(() => {
		document.addEventListener("mouseup" , e => {
			handlersRef.current?.mouseUpHandler(e)
		});

		document.addEventListener("keyup" , e => {
			handlersRef.current?.keyUpHandler(e);
		});

		document.addEventListener("selectionchange" , e => {
			handlersRef.current?.selectionHandler(e);
		});
	} , []);

	const setActiveSessionHandler = (id , handlerObject) => {
		setActiveSession(id);
		handlersRef.current = handlerObject;
	}

	return (
		<EditorContext.Provider value={{ setActiveSessionHandler }}>
			{children}
		</EditorContext.Provider>
	)
}



export default TextEditorProvider;