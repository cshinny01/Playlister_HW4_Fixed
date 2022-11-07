import { useContext} from 'react'
import AuthContext from '../auth'
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Alert } from '@mui/material';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    height: 400,
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};
export default function MUIAccountExists() {
    const {auth} = useContext(AuthContext);
    let text = "";
    let modalClass = "modal";
    let a = false;
    if (auth.isMissingInfoOpen()){
        text += "Info MISSING";
        modalClass += " is-visible";
        a = true;
    }
    else if (auth.isUserExistsModalOpen()){
        text += "USER ALREADY EXISTS";
        modalClass += " is-visible";
        a = true;

    }
    else if (auth.isIncorrectLoginOpen()){
        text += "INCORRECT USER/PASSWORD";
        modalClass += " is-visible";
        a = true;
    }
    else if (auth.isPasswordNoMatchOpen()){
        text += "PASSWORDS DO NOT MATCH";
        modalClass += " is-visible";
        a = true;
    }
    else if (auth.isPasswordLengthOpen()){
        text += "LENGTH OF PASSWORD DOES NOT EXCEED 8 CHARACTERS";
        modalClass += " is-visible";
        a = true;
    }

    function handleClose(event){
        auth.closeModals();
    }
    return (
        <Modal
            open={a}
        >
            <Box sx={style}>
            <div
                id="account-exists-modal"
                className={modalClass}
                data-animation="slideInOutLeft">
                <div className="modal-root" id='Account-exists'>
                    <Alert severity="error">{text}</Alert>
                </div>
                <div className="modal-south">
                    <input type="button" 
                        id="ok-button" 
                        className="modal-button" 
                        onClick={handleClose} 
                        value='Comfirm' />
                </div>
            </div>
            </Box>
            </Modal>
        );
    }