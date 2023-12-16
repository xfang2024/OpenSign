import React, { useEffect, useState, useRef } from "react";
import RenderAllPdfPage from "./component/renderAllPdfPage";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/./signature.css";
import Modal from "react-bootstrap/Modal";
import sign from "../assests/sign3.png";
import stamp from "../assests/stamp2.png";
import { themeColor } from "../utils/ThemeColor/backColor";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";
import FieldsComponent from "./component/fieldsComponent";
import Tour from "reactour";
import Loader from "./component/loader";
import HandleError from "./component/HandleError";
import Nodata from "./component/Nodata";
import SignerListPlace from "./component/signerListPlace";
import Header from "./component/header";
import {
  pdfNewWidthFun,
  contractUsers,
  getHostUrl,
  randomId,
  addZIndex,
  createDocument
} from "../utils/Utils";
import RenderPdf from "./component/renderPdf";
import ModalComponent from "./component/modalComponent";
const TemplatePlaceholder = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const [pdfDetails, setPdfDetails] = useState([]);
  const [isMailSend, setIsMailSend] = useState(false);
  const [allPages, setAllPages] = useState(null);
  const numPages = 1;
  const [pageNumber, setPageNumber] = useState(1);
  const [signBtnPosition, setSignBtnPosition] = useState([]);
  const [xySignature, setXYSignature] = useState({});
  const [dragKey, setDragKey] = useState();
  const [signersdata, setSignersData] = useState([]);
  const [signerObjId, setSignerObjId] = useState();
  const [signerPos, setSignerPos] = useState([]);
  const [isSelectListId, setIsSelectId] = useState();
  const [isSendAlert, setIsSendAlert] = useState(false);
  const [isCreateDocModal, setIsCreateDocModal] = useState(false);
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
    message: "This might take some time"
  });
  const [handleError, setHandleError] = useState();
  const [currentEmail, setCurrentEmail] = useState();
  const [pdfNewWidth, setPdfNewWidth] = useState();
  const [placeholderTour, setPlaceholderTour] = useState(true);
  const [checkTourStatus, setCheckTourStatus] = useState(false);
  const [tourStatus, setTourStatus] = useState([]);
  const [signerUserId, setSignerUserId] = useState();
  const [noData, setNoData] = useState(false);
  const [pdfOriginalWidth, setPdfOriginalWidth] = useState();
  const [pdfOriginalHeight, setPdfOriginalHeight] = useState();
  const [contractName, setContractName] = useState("");
  const [containerWH, setContainerWH] = useState();
  const signRef = useRef(null);
  const dragRef = useRef(null);
  const divRef = useRef(null);
  const [isShowEmail, setIsShowEmail] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(false);
  const [isResize, setIsResize] = useState(false);
  const [isSigners, setIsSigners] = useState(false);
  const [zIndex, setZIndex] = useState(1);
  const [pdfLoadFail, setPdfLoadFail] = useState({
    status: false,
    type: "load"
  });
  const color = [
    "#93a3db",
    "#e6c3db",
    "#c0e3bc",
    "#bce3db",
    "#b8ccdb",
    "#ceb8db",
    "#ffccff",
    "#99ffcc",
    "#cc99ff",
    "#ffcc99",
    "#66ccff",
    "#ffffcc"
  ];
  const isMobile = window.innerWidth < 767;
  const [{ isOver }, drop] = useDrop({
    accept: "BOX",
    drop: (item, monitor) => addPositionOfSignature(item, monitor),
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  });
  const [{ isDragSign }, dragSignature] = useDrag({
    type: "BOX",

    item: {
      type: "BOX",
      id: 1,
      text: "drag me"
    },
    collect: (monitor) => ({
      isDragSign: !!monitor.isDragging()
    })
  });
  const [{ isDragStamp }, dragStamp] = useDrag({
    type: "BOX",

    item: {
      type: "BOX",
      id: 2,
      text: "drag me"
    },
    collect: (monitor) => ({
      isDragStamp: !!monitor.isDragging()
    })
  });

  const [{ isDragSignatureSS }, dragSignatureSS] = useDrag({
    type: "BOX",

    item: {
      type: "BOX",
      id: 3,
      text: "drag me"
    },
    collect: (monitor) => ({
      isDragSignatureSS: !!monitor.isDragging()
    })
  });

  const [{ isDragStampSS }, dragStampSS] = useDrag({
    type: "BOX",

    item: {
      type: "BOX",
      id: 4,
      text: "drag me"
    },
    collect: (monitor) => ({
      isDragStampSS: !!monitor.isDragging()
    })
  });

  const [uniqueId, setUniqueId] = useState("");
  const [isModalRole, setIsModalRole] = useState(false);
  const [roleName, setRoleName] = useState("");
  const senderUser =
    localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    ) &&
    localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
  const jsonSender = JSON.parse(senderUser);

  useEffect(() => {
    fetchTemplate();
  }, []);

  useEffect(() => {
    if (divRef.current) {
      const pdfWidth = pdfNewWidthFun(divRef);
      setPdfNewWidth(pdfWidth);
      setContainerWH({
        width: divRef.current.offsetWidth,
        height: divRef.current.offsetHeight
      });
    }
  }, [divRef.current]);
  const fetchTemplate = async () => {
    const params = { templateId: templateId };
    const templateDeatils = await axios.post(
      `${localStorage.getItem("baseUrl")}functions/getTemplate`,
      params,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      }
    );
    // console.log("templateDeatils.data ", templateDeatils.data);
    const documentData =
      templateDeatils.data && templateDeatils.data.result
        ? [templateDeatils.data.result]
        : [];
    // console.log("documentData ", documentData)
    if (documentData && documentData.length > 0) {
      setPdfDetails(documentData);
      const currEmail = documentData[0].ExtUserPtr.Email;
      if (documentData[0].Signers && documentData[0].Signers.length > 0) {
        const updateSigners = documentData[0].Signers.map((x, index) => ({
          ...x,
          Id: randomId(),
          Role: "User " + (index + 1)
        }));
        console.log("documentData[0] ", documentData[0]);
        // console.log("updateSigners ", updateSigners);
        // setSignersData(updateSigners);
        setIsSigners(true);
        setUniqueId(updateSigners[0].Id);
        setSignerObjId(documentData[0].Signers[0].objectId);
        setContractName(documentData[0].Signers[0].className);
        setIsSelectId(0);
        if (
          documentData[0].Placeholders &&
          documentData[0].Placeholders.length > 0
        ) {
          setSignerPos(documentData[0].Placeholders);

          const arr = documentData[0].Placeholders.filter(
            (x) => !x.signerObjId
          );
          console.log("arr ", arr);
          let updateArr = [...updateSigners];
          arr.forEach((x) => {
            const obj = {
              Role: x.Role,
              Id: randomId()
            };
            updateArr.push(obj);
          });
          console.log("res ", updateArr);
          setSignersData(updateArr);
        } else {
          setSignersData(updateSigners);
        }
      } else {
        setRoleName("User 1");
        if (
          documentData[0].Placeholders &&
          documentData[0].Placeholders.length > 0
        ) {
          const arr = documentData[0].Placeholders?.filter(
            (x) => !x.signerObjId
          );
          console.log("arr ", arr);
          let updateArr = [];
          arr.forEach((x) => {
            const obj = {
              Role: x.Role,
              Id: randomId()
            };
            updateArr.push(obj);
          });
          setSignerPos(documentData[0].Placeholders);
          setSignersData(updateArr);
          setIsSelectId(0);
        }
      }
    } else if (
      documentData === "Error: Something went wrong!" ||
      (documentData.result && documentData.result.error)
    ) {
      const loadObj = {
        isLoad: false
      };
      setHandleError("Error: Something went wrong!");
      setIsLoading(loadObj);
    } else {
      setNoData(true);

      const loadObj = {
        isLoad: false
      };
      setIsLoading(loadObj);
    }
    const res = await contractUsers(jsonSender.email);
    if (res[0] && res.length) {
      console.log("res[0] ", res);
      setSignerUserId(res[0].objectId);
      setCurrentEmail(res[0].Email);
      const tourstatus = res[0].TourStatus && res[0].TourStatus;
      if (tourstatus && tourstatus.length > 0) {
        setTourStatus(tourstatus);
        const checkTourRecipients = tourstatus.filter(
          (data) => data.placeholder
        );
        if (checkTourRecipients && checkTourRecipients.length > 0) {
          setCheckTourStatus(checkTourRecipients[0].placeholder);
        }
      }
      const loadObj = {
        isLoad: false
      };
      setIsLoading(loadObj);
    } else if (res === "Error: Something went wrong!") {
      const loadObj = {
        isLoad: false
      };
      setHandleError("Error: Something went wrong!");
      setIsLoading(loadObj);
    } else if (res.length === 0) {
      setNoData(true);

      const loadObj = {
        isLoad: false
      };
      setIsLoading(loadObj);
    }
  };

  //function for setting position after drop signature button over pdf
  const addPositionOfSignature = (item, monitor) => {
    if (isMobile) {
      if (selectedEmail) {
        getSignerPos(item, monitor);
      } else {
        setIsShowEmail(true);
      }
    } else {
      getSignerPos(item, monitor);
    }
  };

  const getSignerPos = (item, monitor) => {
    console.log("item ", item);
    const posZIndex = zIndex + 1;
    setZIndex(posZIndex);
    const newWidth = containerWH.width;
    const scale = pdfOriginalWidth / newWidth;
    const key = randomId();
    // let filterSignerPos = signerPos.filter(
    //   (data) => data.signerObjId === signerObjId
    // );
    let filterSignerPos = signerPos.filter((data) => data.Id === uniqueId);
    let dropData = [];
    let xyPosArr = [];
    let xyPos = {};
    if (item === "onclick") {
      const dropObj = {
        xPosition: window.innerWidth / 2 - 100,
        yPosition: window.innerHeight / 2 - 60,
        isStamp: monitor,
        key: key,
        isDrag: false,
        scale: scale,
        isMobile: isMobile,
        yBottom: window.innerHeight / 2 - 60,
        zIndex: posZIndex
      };
      dropData.push(dropObj);
      xyPos = {
        pageNumber: pageNumber,
        pos: dropData
      };

      xyPosArr.push(xyPos);
    } else if (item.type === "BOX") {
      const offset = monitor.getClientOffset();
      //adding and updating drop position in array when user drop signature button in div
      const containerRect = document
        .getElementById("container")
        .getBoundingClientRect();
      const x = offset.x - containerRect.left;
      const y = offset.y - containerRect.top;
      const ybottom = containerRect.bottom - offset.y;

      const dropObj = {
        xPosition: signBtnPosition[0] ? x - signBtnPosition[0].xPos : x,
        yPosition: signBtnPosition[0] ? y - signBtnPosition[0].yPos : y,
        isStamp: isDragStamp || isDragStampSS ? true : false,
        key: key,
        isDrag: false,
        firstXPos: signBtnPosition[0] && signBtnPosition[0].xPos,
        firstYPos: signBtnPosition[0] && signBtnPosition[0].yPos,
        yBottom: ybottom,
        scale: scale,
        isMobile: isMobile,
        zIndex: posZIndex
      };

      dropData.push(dropObj);
      xyPos = {
        pageNumber: pageNumber,
        pos: dropData
      };

      xyPosArr.push(xyPos);
    }

    //add signers objId first inseretion
    if (filterSignerPos.length > 0) {
      // const colorIndex = signerPos
      //   .map((e) => e.signerObjId)
      //   .indexOf(signerObjId);

      const colorIndex = signerPos.map((e) => e.Id).indexOf(uniqueId);

      const getPlaceHolder = filterSignerPos[0].placeHolder;
      const updatePlace = getPlaceHolder.filter(
        (data) => data.pageNumber !== pageNumber
      );
      const getPageNumer = getPlaceHolder.filter(
        (data) => data.pageNumber === pageNumber
      );

      //add entry of position for same signer on multiple page
      if (getPageNumer.length > 0) {
        const getPos = getPageNumer[0].pos;
        const newSignPos = getPos.concat(dropData);
        let xyPos = {
          pageNumber: pageNumber,
          pos: newSignPos
        };
        updatePlace.push(xyPos);
        let placeHolderPos;
        if (contractName) {
          placeHolderPos = {
            blockColor: color[isSelectListId],
            signerObjId: signerObjId,
            placeHolder: updatePlace,
            signerPtr: {
              __type: "Pointer",
              className: `${contractName}`,
              objectId: signerObjId
            },
            Role: roleName,
            Id: uniqueId
          };
        } else {
          placeHolderPos = {
            blockColor: color[isSelectListId],
            signerObjId: "",
            placeHolder: updatePlace,
            signerPtr: {},
            Role: roleName,
            Id: uniqueId
          };
        }
        // signerPos.splice(colorIndex, 1, placeHolderPos);
        const newArry = [placeHolderPos];
        const newArray = [
          ...signerPos.slice(0, colorIndex),
          ...newArry,
          ...signerPos.slice(colorIndex + 1)
        ];
        setSignerPos(newArray);
      } else {
        const newSignPoss = getPlaceHolder.concat(xyPosArr[0]);
        let placeHolderPos;
        if (contractName) {
          placeHolderPos = {
            blockColor: color[isSelectListId],
            signerObjId: signerObjId,
            placeHolder: newSignPoss,
            signerPtr: {
              __type: "Pointer",
              className: `${contractName}`,
              objectId: signerObjId
            },
            Role: roleName,
            Id: uniqueId
          };
        } else {
          placeHolderPos = {
            blockColor: color[isSelectListId],
            signerObjId: "",
            placeHolder: newSignPoss,
            signerPtr: {},
            Role: roleName,
            Id: uniqueId
          };
        }

        // signerPos.splice(colorIndex, 1, placeHolderPos);
        const newArry = [placeHolderPos];
        const newArray = [
          ...signerPos.slice(0, colorIndex),
          ...newArry,
          ...signerPos.slice(colorIndex + 1)
        ];

        setSignerPos(newArray);
      }
    } else {
      let placeHolderPos;
      if (contractName) {
        placeHolderPos = {
          signerPtr: {
            __type: "Pointer",
            className: `${contractName}`,
            objectId: signerObjId
          },
          signerObjId: signerObjId,
          blockColor: color[isSelectListId],
          placeHolder: xyPosArr,
          Role: roleName,
          Id: uniqueId
        };
      } else {
        placeHolderPos = {
          signerPtr: {},
          signerObjId: "",
          blockColor: color[isSelectListId],
          placeHolder: xyPosArr,
          Role: roleName,
          Id: uniqueId
        };
      }

      setSignerPos((prev) => [...prev, placeHolderPos]);
    }
    setIsMailSend(false);
  };
  //function for get pdf page details
  const pageDetails = async (pdf) => {
    const load = {
      status: true
    };
    setPdfLoadFail(load);
    pdf.getPage(1).then((pdfPage) => {
      const pageWidth = pdfPage.view[2];
      const pageHeight = pdfPage.view[3];
      setPdfOriginalWidth(pageWidth);
      setPdfOriginalHeight(pageHeight);
    });
  };
  //function for save x and y position and show signature  tab on that position
  const handleTabDrag = (key) => {
    setDragKey(key);
  };

  //function for set and update x and y postion after drag and drop signature tab
  const handleStop = (event, dragElement, signerId, key) => {
    if (!isResize) {
      const dataNewPlace = addZIndex(signerPos, key, setZIndex);
      let updateSignPos = [...signerPos];
      updateSignPos.splice(0, updateSignPos.length, ...dataNewPlace);
      // signerPos.splice(0, signerPos.length, ...dataNewPlace);
      const containerRect = document
        .getElementById("container")
        .getBoundingClientRect();
      const signId = signerId; //? signerId : signerObjId;
      const keyValue = key ? key : dragKey;
      const ybottom = containerRect.height - dragElement.y;

      if (keyValue >= 0) {
        const filterSignerPos = updateSignPos.filter(
          (data) => data.Id === signId
        );

        if (filterSignerPos.length > 0) {
          const getPlaceHolder = filterSignerPos[0].placeHolder;

          const getPageNumer = getPlaceHolder.filter(
            (data) => data.pageNumber === pageNumber
          );

          if (getPageNumer.length > 0) {
            const getXYdata = getPageNumer[0].pos;

            const getPosData = getXYdata;
            const addSignPos = getPosData.map((url, ind) => {
              if (url.key === keyValue) {
                return {
                  ...url,
                  xPosition: dragElement.x,
                  yPosition: dragElement.y,
                  isDrag: true,
                  yBottom: ybottom
                };
              }
              return url;
            });

            const newUpdateSignPos = getPlaceHolder.map((obj, ind) => {
              if (obj.pageNumber === pageNumber) {
                return { ...obj, pos: addSignPos };
              }
              return obj;
            });
            const newUpdateSigner = updateSignPos.map((obj, ind) => {
              if (obj.Id === signId) {
                return { ...obj, placeHolder: newUpdateSignPos };
              }
              return obj;
            });

            setSignerPos(newUpdateSigner);
          }
        }
      }
    }
    setIsMailSend(false);
  };

  //function for delete signature block
  const handleDeleteSign = (key, Id) => {
    const updateData = [];
    // const filterSignerPos = signerPos.filter(
    //   (data) => data.signerObjId === signerId
    // );

    const filterSignerPos = signerPos.filter((data) => data.Id === Id);

    if (filterSignerPos.length > 0) {
      const getPlaceHolder = filterSignerPos[0].placeHolder;

      const getPageNumer = getPlaceHolder.filter(
        (data) => data.pageNumber === pageNumber
      );

      if (getPageNumer.length > 0) {
        const getXYdata = getPageNumer[0].pos.filter(
          (data, ind) => data.key !== key
        );

        if (getXYdata.length > 0) {
          updateData.push(getXYdata);
          const newUpdatePos = getPlaceHolder.map((obj, ind) => {
            if (obj.pageNumber === pageNumber) {
              return { ...obj, pos: updateData[0] };
            }
            return obj;
          });

          const newUpdateSigner = signerPos.map((obj, ind) => {
            if (obj.Id === Id) {
              return { ...obj, placeHolder: newUpdatePos };
            }
            return obj;
          });

          setSignerPos(newUpdateSigner);
        } else {
          const updateFilter = signerPos.filter((data) => data.Id !== Id);
          const getRemainPage = filterSignerPos[0].placeHolder.filter(
            (data) => data.pageNumber !== pageNumber
          );

          if (getRemainPage && getRemainPage.length > 0) {
            const newUpdatePos = filterSignerPos.map((obj, ind) => {
              if (obj.Id === Id) {
                return { ...obj, placeHolder: getRemainPage };
              }
              return obj;
            });
            let signerupdate = [];
            signerupdate = signerPos.filter((data) => data.Id !== Id);
            signerupdate.push(newUpdatePos[0]);

            setSignerPos(signerupdate);
          } else {
            setSignerPos(updateFilter);
          }
        }
      }
    }
  };

  //function for change page
  function changePage(offset) {
    setSignBtnPosition([]);
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  //function for capture position on hover signature button
  const handleDivClick = (e) => {
    const divRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - divRect.left;
    const mouseY = e.clientY - divRect.top;

    const xyPosition = {
      xPos: mouseX,
      yPos: mouseY
    };

    setXYSignature(xyPosition);
  };

  //function for capture position of x and y on hover signature button last position
  const handleMouseLeave = (e) => {
    setSignBtnPosition([xySignature]);
  };

  const alertSendEmail = async () => {
    if (signerPos.length !== signersdata.length) {
      setIsSendAlert(true);
    } else {
      handleSaveTemplate();
    }
  };
  const handleSaveTemplate = async () => {
    const loadObj = {
      isLoad: true,
      message: "This might take some time"
    };
    setIsLoading(loadObj);
    setIsSendAlert(false);
    console.log("signerPos ", signerPos);
    try {
      const data = {
        Placeholders: signerPos,
        SignedUrl: pdfDetails[0].URL
      };

      await axios
        .put(
          `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
            "_appName"
          )}_Template/${templateId}`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              "X-Parse-Session-Token": localStorage.getItem("accesstoken")
            }
          }
        )
        .then((result) => {
          setIsCreateDocModal(true);
          setIsMailSend(true);
          const loadObj = {
            isLoad: false
          };
          setIsLoading(loadObj);
        })
        .catch((err) => {
          console.log("axois err ", err);
        });
    } catch (e) {
      console.log("error", e);
    }
  };
  //here you can add your messages in content and selector is key of particular steps

  const tourConfig = [
    {
      selector: '[data-tut="reactourFirst"]',
      content: `Select a recipient from this list to add a place-holder where he is supposed to sign.The placeholder will appear in the same colour as the recipient name once you drop it on the document.`,
      position: "top",

      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="reactourSecond"]',
      content: `Drag the signature or stamp placeholder onto the PDF to choose your desired signing location.`,
      position: "top",
      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="reactourThird"]',
      content: `Drag the placeholder for a recipient anywhere on the document.Remember, it will appear in the same colour as the name of the recipient for easy reference.`,
      position: "top",
      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="reactourFour"]',
      content: `Clicking "Send" button will share the document with all the recipients.It will also send out emails to everyone on the recipients list.`,
      position: "top",
      style: { fontSize: "13px" }
    }
  ];

  //function for update TourStatus
  const closeTour = async () => {
    setPlaceholderTour(false);
    const extUserClass = localStorage.getItem("extended_class");
    let updatedTourStatus = [];
    if (tourStatus.length > 0) {
      updatedTourStatus = [...tourStatus];
      const placeholderIndex = tourStatus.findIndex(
        (obj) => obj["placeholder"] === false || obj["placeholder"] === true
      );
      if (placeholderIndex !== -1) {
        updatedTourStatus[placeholderIndex] = { placeholder: true };
      } else {
        updatedTourStatus.push({ placeholder: true });
      }
    } else {
      updatedTourStatus = [{ placeholder: true }];
    }
    await axios
      .put(
        `${localStorage.getItem(
          "baseUrl"
        )}classes/${extUserClass}/${signerUserId}`,
        {
          TourStatus: updatedTourStatus
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            sessionToken: localStorage.getItem("accesstoken")
          }
        }
      )
      .then((Listdata) => {
        // const json = Listdata.data;
        // const res = json.results;
      })
      .catch((err) => {
        console.log("axois err ", err);
      });
  };
  const handleCreateDocModal = async () => {
    const hostUrl = getHostUrl();
    // handle create document
    console.log("template ", pdfDetails);
    const res = await createDocument(pdfDetails);
    if (res.status === "success") {
      navigate(`${hostUrl}placeHolderSign/${res.id}`);
    } else {
      setHandleError("Error: Something went wrong!");
    }
  };

  const handleAddSigner = () => {
    setIsModalRole(true);
    setRoleName("");
  };
  const handleAddRole = (e) => {
    e.preventDefault();
    console.log("signerArr", signersdata.length);
    const count = signersdata.length > 0 ? signersdata.length + 1 : 1;
    const Id = randomId();
    const obj = {
      Role: roleName || "User " + count,
      Id: Id
    };
    setSignersData((prevArr) => [...prevArr, obj]);
    // const newWidth = containerWH.width;
    // const scale = pdfOriginalWidth / newWidth;
    // const posZIndex = zIndex + 1;
    // setZIndex(posZIndex);
    // const key = randomId();
    // let dropData = [];
    // let xyPosArr = [];
    // console.log("width ", pdfOriginalWidth);
    // console.log("height ", pdfOriginalHeight);
    // console.log("width ", pdfOriginalWidth / 2);
    // console.log("height ", pdfOriginalHeight / 2);
    // const dropObj = {
    //   xPosition: pdfOriginalWidth / 2, // 213.453125, // newWidth / 2 ,
    //   yPosition: pdfOriginalHeight / 2, //513.953125,//containerWH.height / 2 ,
    //   isStamp: false,
    //   key: key,
    //   isDrag: false,
    //   scale: scale,
    //   isMobile: isMobile,
    //   yBottom: pdfOriginalHeight / 2, //648.046875 // containerWH.height / 2
    //   zIndex: posZIndex
    // };
    // dropData.push(dropObj);
    // const xyPos = {
    //   pageNumber: pageNumber,
    //   pos: dropData
    // };

    // xyPosArr.push(xyPos);

    // const placeHolderPos = {
    //   signerPtr: {},
    //   signerObjId: "",
    //   blockColor: color[isSelectListId],
    //   placeHolder: xyPosArr,
    //   Role: roleName,
    //   Id: Id
    // };

    // console.log("uniqueId ", uniqueId);

    // setSignerPos((prev) => [...prev, placeHolderPos]);
    setIsModalRole(false);
    setRoleName("");
  };
  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        {isLoading.isLoad ? (
          <Loader isLoading={isLoading} />
        ) : handleError ? (
          <HandleError handleError={handleError} />
        ) : noData ? (
          <Nodata />
        ) : (
          <div className="signatureContainer" ref={divRef}>
            {/* this component used for UI interaction and show their functionality */}
            {!checkTourStatus && (
              //this tour component used in your html component where you want to put
              //onRequestClose function to close tour
              //steps is defined what will be your messages and style also
              //isOpen is takes boolean value to open
              <Tour
                onRequestClose={closeTour}
                steps={tourConfig}
                isOpen={placeholderTour}
                rounded={5}
                closeWithMask={false}
              />
            )}
            {/* this component used to render all pdf pages in left side */}
            <RenderAllPdfPage
              signPdfUrl={pdfDetails[0].URL}
              allPages={allPages}
              setAllPages={setAllPages}
              setPageNumber={setPageNumber}
              setSignBtnPosition={setSignBtnPosition}
            />

            {/* pdf render view */}
            <div
              style={{
                marginLeft: !isMobile && pdfOriginalWidth > 500 && "20px",
                marginRight: !isMobile && pdfOriginalWidth > 500 && "20px"
              }}
            >
              {/* this modal is used show alert set placeholder for all signers before send mail */}

              <Modal show={isSendAlert}>
                <Modal.Header className="bg-danger">
                  <span style={{ color: "white" }}>Fields required</span>
                </Modal.Header>

                {/* signature modal */}
                <Modal.Body>
                  <p>Please Add field for all recipients.</p>
                </Modal.Body>

                <Modal.Footer>
                  <button
                    onClick={() => setIsSendAlert(false)}
                    style={{
                      color: "black"
                    }}
                    type="button"
                    className="finishBtn"
                  >
                    Close
                  </button>
                </Modal.Footer>
              </Modal>
              {/* this modal is used show send mail  message and after send mail success message */}
              <Modal show={isCreateDocModal}>
                {/* signature modal */}
                <Modal.Body>
                  <p>Do you want to create document right now ?</p>
                </Modal.Body>
                <Modal.Footer>
                  {currentEmail.length > 0 && (
                    <>
                      <button
                        onClick={() => {
                          setIsCreateDocModal(false);
                        }}
                        style={{
                          color: "black"
                        }}
                        type="button"
                        className="finishBtn"
                      >
                        No
                      </button>

                      <button
                        onClick={() => {
                          handleCreateDocModal();
                        }}
                        style={{
                          background: themeColor(),
                          color: "white"
                        }}
                        type="button"
                        className="finishBtn"
                      >
                        Yes
                      </button>
                    </>
                  )}
                </Modal.Footer>
              </Modal>
              <ModalComponent
                isShow={isShowEmail}
                type={"signersAlert"}
                setIsShowEmail={setIsShowEmail}
              />
              {/* pdf header which contain funish back button */}
              <Header
                isPlaceholder={true}
                pageNumber={pageNumber}
                allPages={allPages}
                changePage={changePage}
                pdfDetails={pdfDetails}
                signerPos={signerPos}
                signersdata={signersdata}
                isMailSend={isMailSend}
                alertSendEmail={alertSendEmail}
                isShowHeader={true}
                currentSigner={true}
                dataTut4="reactourFour"
              />
              <div data-tut="reactourThird">
                {containerWH && (
                  <RenderPdf
                    pageNumber={pageNumber}
                    pdfOriginalWidth={pdfOriginalWidth}
                    pdfNewWidth={pdfNewWidth}
                    pdfDetails={pdfDetails}
                    signerPos={signerPos}
                    successEmail={false}
                    numPages={numPages}
                    pageDetails={pageDetails}
                    placeholder={true}
                    drop={drop}
                    handleDeleteSign={handleDeleteSign}
                    handleTabDrag={handleTabDrag}
                    handleStop={handleStop}
                    setPdfLoadFail={setPdfLoadFail}
                    pdfLoadFail={pdfLoadFail}
                    setSignerPos={setSignerPos}
                    containerWH={containerWH}
                    setIsResize={setIsResize}
                    setZIndex={setZIndex}
                  />
                )}
              </div>
            </div>

            {/* signature button */}
            {isMobile ? (
              <div>
                <FieldsComponent
                  dataTut="reactourFirst"
                  dataTut2="reactourSecond"
                  pdfUrl={isMailSend}
                  sign={sign}
                  stamp={stamp}
                  dragSignature={dragSignature}
                  signRef={signRef}
                  handleDivClick={handleDivClick}
                  handleMouseLeave={handleMouseLeave}
                  isDragSign={isDragSign}
                  themeColor={themeColor}
                  dragStamp={dragStamp}
                  dragRef={dragRef}
                  isDragStamp={isDragStamp}
                  isSignYourself={true}
                  isDragSignatureSS={isDragSignatureSS}
                  dragSignatureSS={dragSignatureSS}
                  dragStampSS={dragStampSS}
                  addPositionOfSignature={addPositionOfSignature}
                  signerPos={signerPos}
                  signersdata={signersdata}
                  isSelectListId={isSelectListId}
                  setSignerObjId={setSignerObjId}
                  setIsSelectId={setIsSelectId}
                  setContractName={setContractName}
                  isSigners={isSigners}
                  setIsShowEmail={setIsShowEmail}
                  isMailSend={isMailSend}
                  setSelectedEmail={setSelectedEmail}
                  selectedEmail={selectedEmail}
                />
              </div>
            ) : (
              <div>
                <div className="signerComponent">
                  <SignerListPlace
                    signerPos={signerPos}
                    signersdata={signersdata}
                    isSelectListId={isSelectListId}
                    setSignerObjId={setSignerObjId}
                    setRoleName={setRoleName}
                    setIsSelectId={setIsSelectId}
                    setContractName={setContractName}
                    handleAddSigner={handleAddSigner}
                    setUniqueId={setUniqueId}
                  />
                  <div data-tut="reactourSecond">
                    <FieldsComponent
                      pdfUrl={isMailSend}
                      sign={sign}
                      stamp={stamp}
                      dragSignature={dragSignature}
                      signRef={signRef}
                      handleDivClick={handleDivClick}
                      handleMouseLeave={handleMouseLeave}
                      isDragSign={isDragSign}
                      themeColor={themeColor}
                      dragStamp={dragStamp}
                      dragRef={dragRef}
                      isDragStamp={isDragStamp}
                      isSignYourself={false}
                      addPositionOfSignature={addPositionOfSignature}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DndProvider>
      <div>
        <Modal show={isModalRole}>
          <Modal.Header className={"bg-info"}>
            <span style={{ color: "white" }}>Add Role</span>
          </Modal.Header>
          <Modal.Body>
            <form
              style={{ display: "flex", flexDirection: "column" }}
              onSubmit={handleAddRole}
            >
              <input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                style={{ borderRadiu: 20 }}
                placeholder={
                  signersdata.length > 0
                    ? "User " + (signersdata.length + 1)
                    : "User 1"
                }
              />
              <div>
                <hr />
                <button
                  type="submit"
                  style={{
                    background: "#00a2b7"
                  }}
                  className="finishBtn"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsModalRole(false)}
                  style={{
                    color: "black"
                  }}
                  type="button"
                  className="finishBtn"
                >
                  Close
                </button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default TemplatePlaceholder;
