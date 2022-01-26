import React, { useContext,  useEffect,  useRef,  useState } from "react";
import { EditorContext } from "./TextEditorProvider";

import Portal from "./Portal"
import "./style.scss";


const colorPalette = [
	"000000",
	"FF9966",
	"6699FF",
	"99FF66",
	"CC0000",
];

const POPUP_EDITOR_WIDTH = 372;
const AVAILABLE_GAP = 24;


const ColorSuggestItem = ({ onClick , color , dataCommand }) => {
	return (
		<a href="#" onClick={e => onClick(dataCommand , e.target)} data-command={dataCommand} data-value={color} style={{backgroundColor: `#${color}`}} className={'palette-item'}></a>
	)
}

const TextEditor = (props) => {

	const { setActiveSessionHandler } = useContext(EditorContext);
	const [isFocusOnSomeInputs , setIsFocusOnSomeInputs] = useState(false);
	const [store, setStore] = useState([]);
	const [showPopupEditor , setShowPopupEditor] = useState(false);
	const [bound, setBound] = useState([0, 0]);


	const actionHandler = (command , targetElement) => {
		console.log('action');
        if (command == "h1" || command == "h2"|| command == "h3" || command == "h4" || command == "h5" || command == "h6" || command == "p") {
            document.execCommand("formatBlock", false, command);
        }
        else if (command == "forecolor" || command == "backcolor") {
			console.log(targetElement.getAttribute("data-value"), 'sadasdasdsadasdsa')
            document.execCommand(command , false , targetElement.getAttribute("data-value"));
        }
		else if (command == "createlink" || command == "insertimage") {
            // url = prompt("Enter the link here: ", "http://");
            // document.execCommand(targetElement.getAttribute("data-command"), false, url);
        } else document.execCommand(targetElement.getAttribute("data-command"), false, null);
		
	}

	function popupPositionSetterHandler({ x = 0 , y = 0 }) {
		const windowWidth = window.innerWidth;
		const endPosObj = { x , y };

		if((x + POPUP_EDITOR_WIDTH + AVAILABLE_GAP) >= windowWidth) {
			endPosObj.x = windowWidth - (POPUP_EDITOR_WIDTH + AVAILABLE_GAP);
		}
		
		setBound([ endPosObj.x , endPosObj.y ]);
	}

	
	
	const contextCallbackClone = useRef();
    useEffect(() => {
        contextCallbackClone.current = ({ canRenderPopup , tempPos }) => ({
			mouseUpHandler(e) {
				console.log(canRenderPopup , 'lorem');
				if(document.getElementById("textEditorPortal")) {
                    const clickInsidePortal = document.getElementById("textEditorPortal").contains(e.target);
                    if(!clickInsidePortal && canRenderPopup) {
                        setShowPopupEditor(false)
                    }else if(!canRenderPopup && !clickInsidePortal) {
						setShowPopupEditor(false)
					}
                }else {
					console.log('come for');
                    if(canRenderPopup) setShowPopupEditor(true)
                    if(tempPos) popupPositionSetterHandler(tempPos)
                }
                // console.log('MOUSE UP');
			},
			keyUpHandler(e){
                if(isFocusOnSomeInputs) {
                    if(canRenderPopup) setShowPopupEditor(true)
                    else setShowPopupEditor(false);
                    if(tempPos) popupPositionSetterHandler(tempPos)
                }

                // console.log('KEY UP');
			},
			selectionHandler(e) {
				console.log('selection' , "lorem");
				let s = document.getSelection();
                const exactSelectedText = s.toString();
                if(exactSelectedText.length) canRenderPopup = true;
                else canRenderPopup = false;
                let oRange = s.getRangeAt(0);
                let oRect = oRange.getBoundingClientRect();
				
				console.log(document.createRange(s.anchorNode));
				

                const pos = {
                    x : oRect.x ,
                    y : oRect.y
                }
                tempPos = pos;
			},
		})
    })

	const innerActiveHandler = () => {
		let canRenderPopup = false;
		let tempPos = null;
		

		setActiveSessionHandler("TEST_ID_1" , contextCallbackClone.current({ canRenderPopup , tempPos }))
	}


    return (
        <div className="container">
			

            <div className="row align-items-center justify-content-center" onMouseDown={innerActiveHandler}>
                <div className="col-md-12 col-lg-8">
                    <div className="editor" id="editor-1">
                        
                        <div id="editor" className="editorAria" suppressContentEditableWarning={true} contentEditable={true}>
                            <h1>Rich Text Editor.</h1>
                            <p>
                                It is a long established fact that a reader will
                                be distracted by the readable content of a page
                                when looking at its layout. The point of using
                                Lorem Ipsum is that it has a more-or-less normal
                                distribution of letters, as opposed to using
                                'Content here, content here', making it look
                                like readable English.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
			{
				showPopupEditor && 
				<Portal>
					<div id="textEditorPortal" style={{ position : "fixed" , background : "red" , zIndex : 99 , left : bound[0] , top : bound[1], transform : "translate(0,24px)"  }}>
						<div style={{ width : POPUP_EDITOR_WIDTH }}>
							<div className="toolbar">
								<a
									href="#"
									onClick={e => actionHandler('undo' , e.target)}
								>
									<RedoIcon />
								</a>
								{/* <a
									href="#"
									onClick={e => actionHandler("redo" , e.target)}
									data-command="redo"
									data-toggle="tooltip"
									data-placement="top"
									title="Redo"
								>
									<i className="fa fa-redo "></i>
									redo
								</a> */}
								<a
									href="#"
									onClick={e => actionHandler('removeFormat' , e.target)}
								>
									<RemoveFormatIcon />
								</a>
								<div className="fore-wrapper">
									<ColorIcon />
									<div className="fore-palette">
										{
											colorPalette.map((color , i) => {
												return <ColorSuggestItem onClick={actionHandler} dataCommand={"forecolor"} color={color} key={i} />
											})
										}
										<input onFocus={setIsFocusOnSomeInputs} onBlur={() => setIsFocusOnSomeInputs(false)} className='fore-input' placeholder='#000000' />
									</div>
								</div>
								<div className="back-wrapper">
									 <BackColorIcon />
									<div className="back-palette">
										{
											colorPalette.map((color , i) => {
												return <ColorSuggestItem onClick={actionHandler} dataCommand={"backcolor"} color={color} key={i} />
											})
										}
										<input onFocus={setIsFocusOnSomeInputs} onBlur={() => setIsFocusOnSomeInputs(false)} className='back-input' onChange={(e) => {if(e.target.value.length === 7) actionHandler("justifyFull" , null)}} placeholder='#000000' />
									</div>
								</div>
								<a
									href="#"
									onClick={e => actionHandler('bold' , e.target)}
								>
									<BoldIcon />
								</a>
								<a
									href="#"
									onClick={e => actionHandler("italic" , e.target)}
								>
									<ItalicIcon />
								</a>
								<a
									href="#"
									onClick={e => actionHandler("underline" , e.target)}
								>
									<UnderlineIcon />
								</a>
								{/* <a
									href="#"
									onClick={e => actionHandler("strikeThrough" , e.target)}
									data-command="strikeThrough"
									data-toggle="tooltip"
									data-placement="top"
									title="Stike through"
								>
									<i className="fa fa-strikethrough"></i>
									str
								</a> */}
								
								<div className="alignment-wrapper">
									<AlignCenterIcon />
									<div className="alignment-wrapper-inner">
										<a
											href="#"
											onClick={e => actionHandler("justifyLeft" , e.target)}
										>
											<AlignLeftIcon />
										</a>
										<a 
											href="#" 
											onClick={e => actionHandler("justifyCenter" , e.target)}
										>
											<AlignCenterIcon />
										</a>
										<a
											href="#"
											onClick={e => actionHandler("justifyRight" , e.target)}
										>
											<AlignRightIcon />
										</a>
										<a
											href="#"
											onClick={e => actionHandler("justifyFull" , e.target)}
										>
											<AlignJustifyIcon />
										</a>
									</div>
								</div>
								
								{/* <a
									href="#"
									onClick={e => actionHandler("indent" , e.target)}
									data-command="indent"
									data-toggle="tooltip"
									data-placement="top"
									title="Indent"
								>
									<TextIndentIcon />
								</a>
								<a
									href="#"
									onClick={e => actionHandler("outdent" , e.target)}
									data-command="outdent"
									data-toggle="tooltip"
									data-placement="top"
									title="Outdent"
								>
									<TextOutdentIcon />
								</a>
								<a
									href="#"
									onClick={e => actionHandler("insertUnorderedList" , e.target)}
									data-command="insertUnorderedList"
									data-toggle="tooltip"
									data-placement="top"
									title="Unordered list"
								>
									<ListIcon />
								</a>
								<a
									href="#"
									onClick={e => actionHandler("insertOrderedList" , e.target)}
									data-command="insertOrderedList"
									data-toggle="tooltip"
									data-placement="top"
									title="Ordered list"
								>
									<ListIcon />
								</a> */}
								<div className="decoration-wrapper">
									<DecorationIcon />
									<div className="decoration-wrapper-inner">
										<a
											href="#"
											onClick={e => actionHandler("h1" , e.target)}
										>
											<Heading1Icon />
										</a>
										<a
											href="#"
											onClick={e => actionHandler("h2" , e.target)}
										>
											<Heading2Icon />
										</a>
										<a
											href="#"
											onClick={e => actionHandler("h3" , e.target)}
										>
											<Heading3Icon />
										</a>
										<a
											href="#"
											onClick={e => actionHandler("h4" , e.target)}
										>
											<Heading4Icon />
										</a>
										<a
											href="#"
											onClick={e => actionHandler("h5" , e.target)}
										>
											<Heading5Icon />
										</a>
										<a
											href="#"
											onClick={e => actionHandler("h6" , e.target)}
										>
											<Heading6Icon />
										</a>
										<a
											href="#"
											onClick={e => actionHandler("p" , e.target)}
										>
											P
										</a>
									</div>
								</div>
							
								<a
									href="#"
									onClick={e => actionHandler("createlink" , e.target)}
								>
									<LinkIcon />
								</a>
								{/* <a
									href="#"
									onClick={e => actionHandler("unlink" , e.target)}
									data-command="unlink"
									data-toggle="tooltip"
									data-placement="top"
									title="Unlink"
								>
									<i className="fa fa-unlink"></i>
								</a> */}
								{/* <a
									href="#"
									onClick={e => actionHandler("insertimage" , e.target)}
									data-command="insertimage"
									data-toggle="tooltip"
									data-placement="top"
									title="Insert image"
								>
									<i className="fa fa-image"></i>
								</a> */}
								{/* <a
									href="#"
									onClick={e => actionHandler("subscript" , e.target)}
									data-command="subscript"
									data-toggle="tooltip"
									data-placement="top"
									title="Subscript"
								>
									<i className="fa fa-subscript"></i>
								</a>
								<a
									href="#"
									onClick={e => actionHandler("superscript" , e.target)}
									data-command="superscript"
									data-toggle="tooltip"
									data-placement="top"
									title="Superscript"
								>
									<i className="fa fa-superscript"></i>
								</a> */}
							</div>
						</div>
					</div>
				</Portal>
			}
        </div>

    );
};


const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 511.904 511.904" style={{enableBackground: 'new 0 0 511.904 511.904'}} width="512" height="512"><g><path d="M222.025,417.764c-33.872,35.124-89.034,38.364-126.784,7.445c-22.482-19.465-33.966-48.733-30.72-78.293   c2.811-21.794,12.997-41.97,28.864-57.173l61.355-61.397c12.492-12.496,12.492-32.752,0-45.248l0,0   c-12.496-12.492-32.752-12.492-45.248,0l-60.053,60.075C22.065,269.57,4.802,304.721,0.649,342.521   c-7.757,85.138,54.972,160.445,140.11,168.202c45.721,4.166,90.933-12.179,123.42-44.618l64.171-64.149   c12.492-12.496,12.492-32.752,0-45.248l0,0c-12.496-12.492-32.752-12.492-45.248,0L222.025,417.764z"/><path d="M451.358,31.289C387.651-15.517,299.186-8.179,244.062,48.484L183.667,108.9c-12.492,12.496-12.492,32.752,0,45.248l0,0   c12.496,12.492,32.752,12.492,45.248,0l61.355-61.291c33.132-34.267,86.738-38.127,124.437-8.96   c38.803,31.818,44.466,89.067,12.648,127.87c-1.862,2.271-3.833,4.45-5.907,6.53l-64.171,64.171   c-12.492,12.496-12.492,32.752,0,45.248l0,0c12.496,12.492,32.752,12.492,45.248,0l64.171-64.171   c60.413-60.606,60.257-158.711-0.349-219.124C461.638,39.727,456.631,35.341,451.358,31.289z"/><path d="M183.667,282.525l99.425-99.425c12.497-12.497,32.758-12.497,45.255,0l0,0c12.497,12.497,12.497,32.758,0,45.255   l-99.425,99.425c-12.497,12.497-32.758,12.497-45.255,0l0,0C171.17,315.283,171.17,295.022,183.667,282.525z"/></g></svg>

const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512"><path d="M7,6H23a1,1,0,0,0,0-2H7A1,1,0,0,0,7,6Z"/><path d="M23,11H7a1,1,0,0,0,0,2H23a1,1,0,0,0,0-2Z"/><path d="M23,18H7a1,1,0,0,0,0,2H23a1,1,0,0,0,0-2Z"/><circle cx="2" cy="5" r="2"/><circle cx="2" cy="12" r="2"/><circle cx="2" cy="19" r="2"/></svg>

const AlignJustifyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512"><path d="M1,6H23a1,1,0,0,0,0-2H1A1,1,0,0,0,1,6Z"/><path d="M23,9H1a1,1,0,0,0,0,2H23a1,1,0,0,0,0-2Z"/><path d="M23,19H1a1,1,0,0,0,0,2H23a1,1,0,0,0,0-2Z"/><path d="M23,14H1a1,1,0,0,0,0,2H23a1,1,0,0,0,0-2Z"/></svg>

const AlignCenterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512"><path d="M1,6H23a1,1,0,0,0,0-2H1A1,1,0,0,0,1,6Z"/><path d="M5,9a1,1,0,0,0,0,2H19a1,1,0,0,0,0-2Z"/><path d="M19,19H5a1,1,0,0,0,0,2H19a1,1,0,0,0,0-2Z"/><path d="M23,14H1a1,1,0,0,0,0,2H23a1,1,0,0,0,0-2Z"/></svg>

const AlignLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512"><path d="M1,6H23a1,1,0,0,0,0-2H1A1,1,0,0,0,1,6Z"/><path d="M1,11H15a1,1,0,0,0,0-2H1a1,1,0,0,0,0,2Z"/><path d="M15,19H1a1,1,0,0,0,0,2H15a1,1,0,0,0,0-2Z"/><path d="M23,14H1a1,1,0,0,0,0,2H23a1,1,0,0,0,0-2Z"/></svg>

const AlignRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512"><path d="M1,6H23a1,1,0,0,0,0-2H1A1,1,0,0,0,1,6Z"/><path d="M23,9H9a1,1,0,0,0,0,2H23a1,1,0,0,0,0-2Z"/><path d="M23,19H9a1,1,0,0,0,0,2H23a1,1,0,0,0,0-2Z"/><path d="M23,14H1a1,1,0,0,0,0,2H23a1,1,0,0,0,0-2Z"/></svg>

const TextIndentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="512" height="512"><path d="M1,6H23a1,1,0,0,0,0-2H1A1,1,0,0,0,1,6Z"/><path d="M23,9H9a1,1,0,0,0,0,2H23a1,1,0,0,0,0-2Z"/><path d="M23,19H1a1,1,0,0,0,0,2H23a1,1,0,0,0,0-2Z"/><path d="M23,14H9a1,1,0,0,0,0,2H23a1,1,0,0,0,0-2Z"/><path d="M1.707,16.245l2.974-2.974a1.092,1.092,0,0,0,0-1.542L1.707,8.755A1,1,0,0,0,0,9.463v6.074A1,1,0,0,0,1.707,16.245Z"/></svg>

const TextOutdentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="304.118" height="215.417" viewBox="0 0 304.118 215.417"><g id="indent" transform="translate(0 -4)">  <path id="Path_1721" data-name="Path 1721" d="M12.672,29.343H291.447a12.672,12.672,0,1,0,0-25.343H12.672a12.672,12.672,0,0,0,0,25.343Z" transform="translate(0)"/>  <path id="Path_1722" data-name="Path 1722" d="M198.074,9H20.672a12.672,12.672,0,1,0,0,25.343h177.4a12.672,12.672,0,1,0,0-25.343Z" transform="translate(93.373 58.358)"/>  <path id="Path_1723" data-name="Path 1723" d="M291.447,19H12.672a12.672,12.672,0,0,0,0,25.343H291.447a12.672,12.672,0,1,0,0-25.343Z" transform="translate(0 175.074)"/>  <path id="Path_1724" data-name="Path 1724" d="M198.074,14H20.672a12.672,12.672,0,1,0,0,25.343h177.4a12.672,12.672,0,1,0,0-25.343Z" transform="translate(93.373 116.716)"/>  <path id="Path_1725" data-name="Path 1725" d="M41.723,107.083,4.038,69.4a13.837,13.837,0,0,1,0-19.54L41.723,12.173a12.672,12.672,0,0,1,21.63,8.972V98.112a12.672,12.672,0,0,1-21.63,8.972Z" transform="translate(0 52.081)"/></g></svg>

const BoldIcon = () => <svg id="Bold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>09 bold</title><path d="M17.954,10.663A6.986,6.986,0,0,0,12,0H5A2,2,0,0,0,3,2V22a2,2,0,0,0,2,2H15a6.994,6.994,0,0,0,2.954-13.337ZM7,4h5a3,3,0,0,1,0,6H7Zm8,16H7V14h8a3,3,0,0,1,0,6Z"/></svg>

const ItalicIcon = () => <svg id="Bold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>11 italic</title><path d="M21,0H6A1.5,1.5,0,0,0,6,3h5.713L9.259,21H3a1.5,1.5,0,0,0,0,3H18a1.5,1.5,0,0,0,0-3H12.287L14.741,3H21a1.5,1.5,0,0,0,0-3Z"/></svg>

const DecorationIcon = () => <svg id="Outline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>10 letter case</title><path d="M7.4,5.553a1.041,1.041,0,0,0-1.789,0l-5.5,11a1,1,0,1,0,1.789.894L3.619,14H9.383l1.724,3.447a1,1,0,1,0,1.789-.894ZM4.619,12,6.5,8.236,8.383,12Z"/><path d="M23,8a1,1,0,0,0-1,1v.026A4.948,4.948,0,0,0,19,8a5,5,0,0,0,0,10,4.948,4.948,0,0,0,3-1.026V17a1,1,0,0,0,2,0V9A1,1,0,0,0,23,8Zm-4,8a3,3,0,1,1,3-3A3,3,0,0,1,19,16Z"/></svg>

const ColorIcon = () => <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,0H5A5.006,5.006,0,0,0,0,5v5a7.009,7.009,0,0,0,7,7H9v4a3,3,0,0,0,6,0V17h2a7.009,7.009,0,0,0,7-7V5A5.006,5.006,0,0,0,19,0ZM2,5A3,3,0,0,1,5,2h5V3a1,1,0,0,0,2,0V2h2V5a1,1,0,0,0,2,0V2h2V7a1,1,0,0,0,2,0V2.184A3,3,0,0,1,22,5v5H2ZM17,15H14a1,1,0,0,0-1,1v5a1,1,0,0,1-2,0V16a1,1,0,0,0-1-1H7a5,5,0,0,1-4.576-3H21.576A5,5,0,0,1,17,15Z"/></svg>

const BackColorIcon = () => <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22.327,18.422C23.055,19.456,24,20.651,24,21.5a2.5,2.5,0,0,1-5,0c0-.775.961-2.008,1.692-3.069A1,1,0,0,1,22.327,18.422Zm-.877-4.558-8.672,8.672a5.006,5.006,0,0,1-7.071,0L1.465,18.293a5,5,0,0,1,0-7.071l5.709-5.71L4.318,2.622A1,1,0,0,1,5.74,1.216L8.588,4.1,10.136,2.55l-.843-.843A1,1,0,0,1,10.707.293l13,13a1,1,0,1,1-1.414,1.414ZM20.036,12.45,11.55,3.964,9.993,5.522,14.711,10.3A1,1,0,1,1,13.289,11.7L8.58,6.935l-5.7,5.7a3,3,0,0,0,0,4.243l4.242,4.243a3.005,3.005,0,0,0,4.243,0Z"/></svg>

const FontIcon = () => <svg id="Layer_1" height="512" viewBox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1"><path d="m19 0h-14a5.006 5.006 0 0 0 -5 5v14a5.006 5.006 0 0 0 5 5h14a5.006 5.006 0 0 0 5-5v-14a5.006 5.006 0 0 0 -5-5zm3 19a3 3 0 0 1 -3 3h-14a3 3 0 0 1 -3-3v-14a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3zm-4-10a1 1 0 0 1 -2 0 1 1 0 0 0 -1-1h-2v8h1a1 1 0 0 1 0 2h-4a1 1 0 0 1 0-2h1v-8h-2a1 1 0 0 0 -1 1 1 1 0 0 1 -2 0 3 3 0 0 1 3-3h6a3 3 0 0 1 3 3z"/></svg>

const RedoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="512" height="512"><path d="M16.9,14.723a1,1,0,0,0,1.414,0l4.949-4.95a2.5,2.5,0,0,0,0-3.536l-4.95-4.949A1,1,0,0,0,16.9,2.7L21.2,7,5,7H5a5,5,0,0,0-5,5v7a5.006,5.006,0,0,0,5,5H19a1,1,0,0,0,0-2H5a3,3,0,0,1-3-3V12A3,3,0,0,1,5,9H5L21.212,9,16.9,13.309A1,1,0,0,0,16.9,14.723Z"/></svg>

const UnderlineIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="385.965" height="459.122" viewBox="0 0 385.965 459.122"><g id="Group_33" data-name="Group 33" transform="translate(-844.2 -427.069)">  <g id="Group_32" data-name="Group 32">	<path id="Path_1733" data-name="Path 1733" d="M933.122,537.514c0,21.873-.08,43.746.017,65.618.215,48.018,30.733,88.48,76.224,101.207,60.455,16.912,122-23.447,130.743-85.712a123.435,123.435,0,0,0,1.129-17.187q.018-69.18.008-138.361c0-7.159,2.681-10.848,7.887-10.882s8.053,3.774,8.053,10.77c0,46.87.086,93.74-.022,140.61-.13,56.673-37.769,104.244-92.779,117.511-63.886,15.409-130.123-26.038-144.2-90.215a122.814,122.814,0,0,1-3-26.372q-.008-71.43,0-142.861c0-6.287,4.08-10.313,9.361-9.346,4.17.764,6.549,3.967,6.561,9.1.035,15.123.013,30.246.013,45.37Z" fill="#020202" stroke="#000" stroke-width="50"/>	<path id="Path_1734" data-name="Path 1734" d="M1037.315,772.245q78.158,0,156.313,0c1.374,0,2.754-.04,4.12.072a7.839,7.839,0,0,1,7.406,7.533,8.039,8.039,0,0,1-7.116,8.254,27.4,27.4,0,0,1-3.369.073q-157.437,0-314.875,0a25.632,25.632,0,0,1-3.742-.1,8.045,8.045,0,0,1-6.847-8.122,7.837,7.837,0,0,1,7.3-7.625c1.365-.121,2.746-.082,4.12-.082Q958.971,772.242,1037.315,772.245Z" transform="translate(0 73)" stroke="#000" stroke-width="50"/>  </g></g></svg>

const RemoveFormatIcon = () => <svg id="Layer_1" height="512" viewBox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1"><path d="m19 2h-9.044a4.966 4.966 0 0 0 -3.946 1.931l-5.8 7.455a1 1 0 0 0 0 1.228l5.8 7.455a4.966 4.966 0 0 0 3.946 1.931h9.044a5.006 5.006 0 0 0 5-5v-10a5.006 5.006 0 0 0 -5-5zm3 15a3 3 0 0 1 -3 3h-9.044a2.979 2.979 0 0 1 -2.368-1.158l-5.321-6.842 5.321-6.842a2.979 2.979 0 0 1 2.368-1.158h9.044a3 3 0 0 1 3 3zm-4.793-6.793-1.793 1.793 1.793 1.793a1 1 0 1 1 -1.414 1.414l-1.793-1.793-1.793 1.793a1 1 0 0 1 -1.414-1.414l1.793-1.793-1.793-1.793a1 1 0 0 1 1.414-1.414l1.793 1.793 1.793-1.793a1 1 0 0 1 1.414 1.414z"/></svg>

const Heading5Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500"><g id="Group_35" data-name="Group 35" transform="translate(-1559 -242)">  <rect id="Rectangle_12" data-name="Rectangle 12" width="500" height="500" transform="translate(1559 242)" fill="none"/>  <g id="Group_34" data-name="Group 34" transform="translate(1238.841 24.074)">	<g id="Group_34-2" data-name="Group 34" transform="translate(413.231 370.415)">	  <path id="Path_1736" data-name="Path 1736" d="M639.282,440.363a69.512,69.512,0,0,1,37.587-8.97c31.271,1.218,59.108,26.826,62.765,57.957,4.2,35.762-17.24,66.513-52.175,74.83-27.575,6.565-58.71-7.079-72.476-31.762-2.295-4.113-1.321-8.451,2.389-10.645s7.908-1.094,10.465,3.084c7.951,12.994,19.263,21.3,34.1,24.729,33.476,7.736,66.235-20.513,63.14-54.634-2.025-22.334-13.694-38.119-34.737-45.566-20.924-7.405-39.694-2.311-55.416,13.452-1.953,1.958-3.924,3.685-6.872,3.626-4.719-.1-7.968-4.22-7.053-9.188q6.518-35.4,13.141-70.789c.49-2.634.954-5.274,1.521-7.891,1.109-5.119,3.519-7.121,8.75-7.154,8.17-.051,16.34-.014,24.51-.014q30.813,0,61.626-.007a12.872,12.872,0,0,1,4.836.57,7.43,7.43,0,0,1-.009,13.948,13.858,13.858,0,0,1-5.187.571q-38.867-.013-77.733.024c-1.294,0-2.954-.816-3.412,1.691C645.911,405.393,642.637,422.535,639.282,440.363Z" transform="translate(-426.479 -371.415)" fill="#040404" stroke="#000" stroke-width="19"/>	  <path id="Path_1737" data-name="Path 1737" d="M413.247,468.448q0-44.124.008-88.249c0-5.729,3.674-9.383,8.511-8.6a7.153,7.153,0,0,1,6.283,6.881c.168,3.143.085,6.3.085,9.451,0,23.23.043,46.46-.052,69.689-.011,2.622.48,3.553,3.379,3.542q49.027-.172,98.054,0c2.884.009,3.4-.9,3.388-3.533-.094-25.214-.057-50.428-.054-75.643,0-1.166-.03-2.339.065-3.5a7.433,7.433,0,0,1,7.335-7.017,7.552,7.552,0,0,1,7.442,6.97c.1,1.042.045,2.1.045,3.15q0,87.024-.007,174.047c0,1.853.187,3.717-.616,5.512a7.411,7.411,0,0,1-7.895,4.493,7.243,7.243,0,0,1-6.27-6.53,37.992,37.992,0,0,1-.1-3.848c0-25.213-.041-50.428.052-75.642.009-2.627-.488-3.549-3.383-3.539q-49.027.171-98.053,0c-2.888-.01-3.4.9-3.386,3.535.093,25.214.057,50.428.053,75.643,0,1.166.028,2.339-.067,3.5a7.443,7.443,0,0,1-7.343,7.012,7.535,7.535,0,0,1-7.43-6.979c-.106-1.159-.046-2.333-.046-3.5Q413.245,511.872,413.247,468.448Z" transform="translate(-413.231 -371.419)" fill="#020202" stroke="#000" stroke-width="19"/>	</g>  </g></g></svg>

const Heading6Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500"><g id="Group_37" data-name="Group 37" transform="translate(-1643 -314)">  <rect id="Rectangle_13" data-name="Rectangle 13" width="500" height="500" transform="translate(1643 314)" fill="none"/>  <g id="Group_36" data-name="Group 36" transform="translate(434.322 307.912)">	<g id="Group_36-2" data-name="Group 36" transform="translate(1294.484 153.885)">	  <path id="Path_1739" data-name="Path 1739" d="M1502,255.85c8.146-8.362,16.615-14.46,26.519-18.279,27.662-10.668,61.262-7.084,82.452,17.554,9.349,10.871,15.106,23.458,15.919,37.717.691,12.12-3.45,23.354-10.091,33.4-13.679,20.7-33.164,30.691-57.951,31.115-16.214.277-31.31-2.891-44.5-12.618-18.02-13.292-27.623-31.188-27.816-53.714-.188-21.971-.061-43.945-.036-65.917.042-35.817,25.045-65.009,60.323-70.467,27.433-4.245,56.39,9.59,70.365,33.617,2.675,4.6,1.957,9.1-1.844,11.568-3.954,2.567-8.511,1.279-11.489-3.389q-17.891-28.049-51.1-26.6c-24.671,1.114-47.384,22.305-50.058,46.888C1501.322,229.354,1502.362,242.033,1502,255.85Zm54.9,85.635a51.147,51.147,0,0,0,50.9-31.542c2.139-5.2,4.062-10.641,3.515-16.284-1.4-14.418-8.05-26.149-19.395-35.152-11.075-8.789-23.918-11.3-37.755-10.968-12.663.306-24.174,3.679-33.687,12.042-24.07,21.161-24.034,49.149.141,70.223C1530.92,338.779,1543.292,342.313,1556.908,341.485Z" transform="translate(-1298.944 -153.885)" fill="#030303" stroke="#000" stroke-width="19"/>	  <path id="Path_1740" data-name="Path 1740" d="M1294.5,255.537q0-46.149.007-92.3c0-6.048,3.722-9.888,8.765-9.159a7.53,7.53,0,0,1,6.7,7.084c.178,2.552.1,5.124.1,7.687,0,25.15.047,50.3-.061,75.449-.012,2.7.59,3.481,3.4,3.472q51.459-.158,102.918,0c2.925.01,3.323-.984,3.315-3.552-.089-26.371-.056-52.741-.052-79.112,0-1.342-.037-2.692.087-4.025a7.734,7.734,0,0,1,7.509-7.1,7.9,7.9,0,0,1,7.879,6.775,20.267,20.267,0,0,1,.092,2.925q.006,91.931,0,183.861c0,5.17-1.745,8.037-5.529,9.2a7.6,7.6,0,0,1-9.919-6.382,34.081,34.081,0,0,1-.116-4.023c-.006-26.371-.058-52.741.069-79.111.015-3.023-.717-3.846-3.779-3.837q-50.909.169-101.819,0c-3.079-.01-4.1.528-4.082,3.918.168,26.247.094,52.5.09,78.744,0,1.342.035,2.692-.091,4.025a7.743,7.743,0,0,1-7.519,7.1,7.883,7.883,0,0,1-7.864-6.786,26.7,26.7,0,0,1-.093-3.658Q1294.495,301.136,1294.5,255.537Z" transform="translate(-1294.484 -153.887)" fill="#020202" stroke="#000" stroke-width="19"/>	</g>  </g></g></svg>

const Heading3Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500"><g id="Group_39" data-name="Group 39" transform="translate(-967 -660)">  <rect id="Rectangle_14" data-name="Rectangle 14" width="500" height="500" transform="translate(967 660)" fill="none"/>  <g id="Group_38" data-name="Group 38" transform="translate(-357.177 97.573)">	<g id="Group_38-2" data-name="Group 38">	  <path id="Path_1742" data-name="Path 1742" d="M1714.865,812.306c11.73,7.165,19.94,16.77,24.318,29.381,10.982,31.637-9.759,66.818-43.082,73.362-8.552,1.679-17.173,1.272-25.78,1.238-9.227-.037-18.481.594-27.65-1.246-24.616-4.94-43.806-27.618-44.4-52.605-.144-6.121,2.57-9.816,7.481-10.184,4.8-.36,8.013,3.114,8.519,9.211,1.7,20.45,14.491,35.043,33.837,38.241,6.549,1.083,13.228.525,19.842.432,8.476-.12,17.005.831,25.42-.9,18.5-3.8,33.112-21.363,32.871-39.463a39.878,39.878,0,0,0-33.853-38.975c-7.041-1.156-14.225-.279-21.34-.5-6.394-.2-10.3-5.3-8.271-10.77,1.39-3.754,4.384-5.29,8.208-5.335,5-.06,10,.062,15-.034,20.424-.39,37.246-14.712,39.76-33.789,2.581-19.587-9.709-38.34-29.05-44.279a21.67,21.67,0,0,0-5.093-1.181c-15.341-.79-30.79-1.969-45.982.5-16.365,2.659-29.138,17.395-30.962,33.823-.179,1.615-.314,3.234-.462,4.851-.469,5.11-3.9,8.457-8.379,8.164-4.577-.3-7.651-3.834-7.54-9.006a54.437,54.437,0,0,1,13.413-35.295c10.46-12.162,23.832-18.928,39.824-19.568,12.844-.514,25.753-.883,38.586.269a57.8,57.8,0,0,1,50.561,43.488c5.624,22.893-3.719,45.5-24.465,59.211C1715.893,811.55,1715.6,811.772,1714.865,812.306Z" fill="#040404" stroke="#000" stroke-width="19"/>	  <path id="Path_1743" data-name="Path 1743" d="M1406.248,812.069q0-47.247.009-94.493c0-6.638,4.555-10.6,10.187-8.92a7.352,7.352,0,0,1,5.691,7.437c.1,5.372.054,10.748.054,16.122,0,22.748.047,45.5-.056,68.245-.013,2.791.484,3.814,3.607,3.8q52.5-.187,104.992,0c3.068.011,3.65-.93,3.639-3.772-.1-27-.063-53.995-.06-80.993,0-1.249-.032-2.5.068-3.747a7.96,7.96,0,0,1,7.845-7.522,8.09,8.09,0,0,1,7.98,7.453c.1.991.047,2,.047,3q0,93.555,0,187.11c0,1.862.145,3.727-.659,5.527a7.94,7.94,0,0,1-8.448,4.822,7.755,7.755,0,0,1-6.722-6.984,40.4,40.4,0,0,1-.1-4.12c-.005-27-.043-54,.054-80.993.01-2.8-.492-3.812-3.61-3.8q-52.5.186-104.991,0c-3.072-.01-3.647.937-3.636,3.775.1,27,.062,53.995.058,80.993,0,1.249.031,2.5-.07,3.747a7.972,7.972,0,0,1-7.854,7.517,8.072,8.072,0,0,1-7.966-7.463c-.114-1.24-.049-2.5-.049-3.747Q1406.246,858.565,1406.248,812.069Z" fill="#020202" stroke="#000" stroke-width="19"/>	</g>  </g></g></svg>

const Heading4Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500"><g id="Group_42" data-name="Group 42" transform="translate(-1751 -778)">  <rect id="Rectangle_15" data-name="Rectangle 15" width="500" height="500" transform="translate(1751 778)" fill="none"/>  <g id="Group_41" data-name="Group 41" transform="translate(1577.258 151.286)">	<g id="Group_40" data-name="Group 40">	  <path id="Path_1745" data-name="Path 1745" d="M399.752,876.751q0,47.246-.007,94.492c0,6.562-4.182,10.538-9.665,9.236-3.687-.876-5.849-3.225-6.173-7.035-.168-1.987-.094-4-.1-5.995,0-26.373-.044-52.746.058-79.119.011-2.71-.524-3.6-3.445-3.586q-52.683.168-105.367,0c-2.949-.01-3.436.924-3.426,3.6.1,26.748.059,53.5.059,80.244,0,1,.015,2,0,3-.105,5.606-3.393,9.313-8.13,9.18-4.665-.131-7.79-3.736-7.8-9.169q-.042-24.936-.01-49.871,0-69.557,0-139.114c0-5.482,1.873-8.426,5.994-9.525a7.757,7.757,0,0,1,9.817,6.588,34.258,34.258,0,0,1,.124,4.119c.006,27,.058,54-.069,80.993-.014,3.046.647,3.976,3.831,3.966q52.308-.177,104.616,0c3.2.011,3.832-.948,3.818-3.978-.126-26.622-.073-53.245-.073-79.868,0-.875-.008-1.75,0-2.625.065-5.928,3.264-9.694,8.12-9.563,4.773.129,7.813,3.788,7.815,9.534Q399.766,829.5,399.752,876.751Z" fill="#020202" stroke="#000" stroke-width="19"/>	  <path id="Path_1746" data-name="Path 1746" d="M559.689,839.467c0,19.242.076,38.484-.078,57.725-.025,3.044.886,3.718,3.738,3.622,6.24-.211,12.492-.078,18.739-.061,5.955.016,9.677,3.136,9.644,8.044-.033,4.924-3.639,7.861-9.755,7.886s-12.26.262-18.362-.092c-3.567-.206-4.02,1.127-3.994,4.225.143,16.867.027,33.735.1,50.6.017,3.843-1.112,6.936-4.717,8.6-5.442,2.518-11.184-1.47-11.226-7.87-.085-12.994-.027-25.989-.027-38.983,0-4.5-.214-9.01.074-13.49.2-3.05-1.308-3.031-3.552-3.026q-38.421.082-76.842.035c-7.372,0-14.745-.075-22.115.03-3.955.057-7.232-.957-8.857-4.852-1.524-3.657-.249-6.706,2.263-9.571q48.049-54.806,96.026-109.674c4.689-5.357,9.357-10.734,14.055-16.083,3.144-3.579,6.384-4.665,9.894-3.18,3.841,1.624,5.04,4.756,5.025,8.758C559.65,801.233,559.689,820.35,559.689,839.467Zm-15.94-37.406c-29.035,33.18-57.444,65.646-86.23,98.544,1.023.077,1.469.139,1.916.14,27.23,0,54.461-.041,81.69.074,2.645.012,2.657-1.114,2.654-3.078q-.069-35.6-.03-71.2Z" fill="#010101" stroke="#000" stroke-width="19"/>	</g>  </g></g></svg>

const Heading1Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42"><g id="Group_44" data-name="Group 44" transform="translate(-767.67 22.333)">  <g id="Group_43" data-name="Group 43" transform="translate(767.67 -22.333)">	<rect id="Rectangle_15" data-name="Rectangle 15" width="42" height="42" fill="none"/>	<g id="Group_45" data-name="Group 45" transform="translate(8.738 12.566)">	  <path id="Path_1748" data-name="Path 1748" d="M853.848,97q0,3.657,0,7.315c0,.109,0,.219-.007.327a.629.629,0,0,1-.61.577.642.642,0,0,1-.639-.55,2.138,2.138,0,0,1-.008-.3c0-2.151-.006-4.3.007-6.452,0-.272-.077-.315-.326-.314q-4.118.014-8.236,0c-.249,0-.329.042-.328.315.014,2.141.008,4.282.008,6.423,0,.571-.238.888-.655.876s-.625-.314-.625-.876q0-7.374,0-14.748c0-.561.218-.863.627-.873s.653.306.653.878c0,2.141,0,4.282-.005,6.423,0,.233.035.316.3.315q4.148-.017,8.3,0c.225,0,.294-.046.293-.285-.01-2.2-.007-4.4-.005-6.6,0-.5.339-.805.764-.705a.589.589,0,0,1,.493.556c.01.108.007.218.007.327Q853.848,93.315,853.848,97Z" transform="translate(-842.427 -88.716)" fill="#050505" stroke="#000" stroke-width="2"/>	  <path id="Path_1749" data-name="Path 1749" d="M1070.266,96.493c0,2.368,0,4.736-.005,7.1,0,.22.047.285.273.276.5-.019,1.01-.009,1.516-.005.455,0,.745.248.755.625s-.291.652-.757.653q-2.422,0-4.845,0c-.454,0-.739-.253-.741-.635s.282-.637.734-.642c.525-.005,1.05-.008,1.575,0,.176,0,.236-.037.236-.227q-.008-6.747,0-13.494c0-.183-.049-.236-.231-.232-.545.011-1.09.015-1.635,0a.636.636,0,0,1-.61-.921.622.622,0,0,1,.579-.351c.832-.007,1.665-.012,2.5,0,.435.007.66.276.66.743Q1070.267,92.941,1070.266,96.493Z" transform="translate(-1048.691 -88.638)" fill="#030303" stroke="#000" stroke-width="2"/>	</g>  </g></g></svg>

const Heading2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500"><g id="Group_48" data-name="Group 48" transform="translate(-301 -2868)">  <g id="Group_47" data-name="Group 47" transform="translate(352.754 2810.277)">	<g id="Group_46" data-name="Group 46" transform="translate(0 9.767)">	  <path id="Path_1751" data-name="Path 1751" d="M260.956,381.92h4.8q45.56,0,91.119,0a28.15,28.15,0,0,1,3.567.1c4.234.543,7.06,3.647,7.04,7.629s-2.874,7.022-7.119,7.575a16.66,16.66,0,0,1-2.14.076q-59.317.006-118.634.013a10.157,10.157,0,0,1-6.123-1.511c-4.523-3.183-4.237-9.2.684-12.907q18.675-14.073,37.4-28.075,29.273-21.957,58.542-43.92c13.071-9.83,20.4-22.846,21.938-39.2,2.493-26.506-17.122-52.127-43.437-56.508-32.759-5.453-61.012,17.188-63.08,50.535a18.683,18.683,0,0,1-.574,4.577,7.568,7.568,0,0,1-8.234,4.864,7.694,7.694,0,0,1-6.434-7.84,67.058,67.058,0,0,1,6.508-28.989,68.893,68.893,0,0,1,71.558-38.74c29.656,4.082,53.979,27.525,58.234,57.123,3.836,26.691-5.043,48.987-26.334,65.513-25.375,19.7-51.316,38.661-77.012,57.944C262.758,380.527,262.3,380.89,260.956,381.92Z" transform="translate(-9.011)" fill="#040404" stroke="#000" stroke-width="19"/>	  <path id="Path_1752" data-name="Path 1752" d="M38.248,298.1q0-45.028.006-90.058c0-5.766,3.377-9.447,8.173-9.021a7.445,7.445,0,0,1,6.923,6.939c.154,1.895.09,3.808.091,5.715,0,25.134.042,50.271-.055,75.405-.01,2.582.5,3.427,3.283,3.419q50.211-.16,100.422,0c2.811.009,3.275-.882,3.265-3.436-.092-25.492-.056-50.984-.056-76.477,0-.953-.013-1.906,0-2.859.093-5.344,3.221-8.878,7.741-8.754,4.444.122,7.429,3.56,7.442,8.732.031,12.985.01,25.969.01,38.954q0,70.581,0,141.162c0,5.211-1.8,8.034-5.714,9.084a7.39,7.39,0,0,1-9.357-6.278,32.842,32.842,0,0,1-.116-3.926c-.007-25.731-.055-51.462.066-77.192.013-2.911-.63-3.785-3.656-3.774q-49.853.167-99.707,0c-3.059-.01-3.645.919-3.632,3.8.118,25.373.069,50.747.069,76.121,0,.834.009,1.668,0,2.5-.066,5.645-3.127,9.236-7.754,9.1-4.551-.131-7.431-3.611-7.433-9.1Q38.235,343.13,38.248,298.1Z" transform="translate(0 -0.001)" fill="#020202" stroke="#000" stroke-width="19"/>	</g>  </g>  <rect id="Rectangle_16" data-name="Rectangle 16" width="500" height="500" transform="translate(301 2868)" fill="none"/></g></svg>




export default TextEditor;
