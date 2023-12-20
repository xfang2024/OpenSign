import React, { useState } from "react";
import check from "../../assests/checkBox.png";
import { themeColor } from "../../utils/ThemeColor/backColor";
import "../../css/signerListPlace.css";

function SignerListPlace({
  signerPos,
  signersdata,
  isSelectListId,
  setSignerObjId,
  setIsSelectId,
  setContractName,
  handleAddSigner,
  setUniqueId,
  setRoleName,
  handleDeleteUser,
  handleRoleChange
}) {
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

  const nameColor = [
    "#304fbf",
    "#7d5270",
    "#5f825b",
    "#578077",
    "#576e80",
    "#6d527d",
    "#cc00cc",
    "#006666",
    "#cc00ff",
    "#ff9900",
    "#336699",
    "#cc9900"
  ];
  const [isHover, setIsHover] = useState();

  //function for onhover signer name change background color
  const onHoverStyle = (ind, blockColor) => {
    console.log("blockColor ", blockColor)
    const style = {
      background: blockColor ? blockColor : color[ind % color.length],
      padding: "10px",
      marginTop: "2px",
      display: "flex",
      flexDirection: "row",
      borderBottom: "1px solid #e3e1e1"
    };
    return style;
  };
  //function for onhover signer name remove background color
  const nonHoverStyle = (ind) => {
    const style = {
      // width:"250px",
      padding: "10px",
      marginTop: "2px",
      display: "flex",
      flexDirection: "row",
      borderBottom: "1px solid #e3e1e1",
      justifyContent: "space-between"
    };
    return style;
  };

  const getFirstLetter = (name) => {
    const firstLetter = name?.charAt(0);
    return firstLetter;
  };

  const darkenColor = ( color, factor ) => {
    // Remove '#' from the color code and parse it to get RGB values
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
  
    // Darken the color by reducing each RGB component
    const darkerR = Math.floor(r * (1 - factor));
    const darkerG = Math.floor(g * (1 - factor));
    const darkerB = Math.floor(b * (1 - factor));
  
    // Convert the darkened RGB components back to hex
    return `#${(darkerR << 16 | darkerG << 8 | darkerB).toString(16).padStart(6, '0')}`;
  }  

  return (
    <div>
      <div
        style={{
          background: themeColor(),
          padding: "5px"
        }}
      >
        <span className="signedStyle">Reicipents</span>
      </div>

      <div className="signerList">
        <>
          {signersdata.length > 0 &&
            signersdata.map((obj, ind) => {
              return (
                <div
                  data-tut="reactourFirst"
                  onMouseEnter={() => setIsHover(ind)}
                  onMouseLeave={() => setIsHover(null)}
                  key={ind}
                  style={
                    isHover === ind || isSelectListId === ind
                      ? onHoverStyle(ind, obj.blockColor)
                      : nonHoverStyle(ind)
                  }
                  onClick={() => {
                    setSignerObjId(obj?.objectId);
                    setIsSelectId(ind);
                    setContractName(obj?.className);
                    setUniqueId(obj.Id);
                    setRoleName(obj.Role);
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row"
                    }}
                  >
                    <div
                      className="signerStyle"
                      style={{
                        background: obj.blockColor
                          ? darkenColor(obj.blockColor, 0.4)
                          : nameColor[ind % nameColor.length],
                        width: 20,
                        height: 20,
                        display: "flex",
                        borderRadius : 30 / 2,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: "20px",
                        marginTop: "5px"
                      }}
                    >
                      <span
                        style={{
                          fontSize: "8px",
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "white",
                          textTransform: "uppercase"
                        }}
                      >
                        {obj.Name
                          ? getFirstLetter(obj.Name)
                          : getFirstLetter(obj.Role)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: obj.Name ? "column" : "row",
                        alignItems: "center"
                      }}
                    >
                      {obj.Name ? (
                        <span className="userName">{obj.Name}</span>
                      ) : (
                        <>
                          {handleRoleChange ? (
                            <span
                              className="userName"
                              contentEditable
                              onBlur={(e) => handleRoleChange(e, obj.Id)}
                            >
                              {obj.Role}
                            </span>
                          ) : (
                            <span className="userName">{obj.Role}</span>
                          )}
                        </>
                      )}
                      {obj.Email && (
                        <span className="useEmail">{obj.Email}</span>
                      )}
                    </div>
                  </div>
                  {handleDeleteUser && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(obj.Id);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </div>
                  )}
                  {signerPos.map((data, key) => {
                    return (
                      data.Id === obj.Id && (
                        <div key={key}>
                          <img
                            alt="no img"
                            src={check}
                            width={20}
                            height={20}
                          />
                        </div>
                      )
                    );
                  })}
                  <hr />
                </div>
              );
            })}
        </>
      </div>
      {handleAddSigner && (
        <div className="addSignerBtn" onClick={() => handleAddSigner()}>
          <i className="fa-solid fa-plus"></i>
          <span style={{ marginLeft: 2 }}>Add</span>
        </div>
      )}
    </div>
  );
}

export default SignerListPlace;
