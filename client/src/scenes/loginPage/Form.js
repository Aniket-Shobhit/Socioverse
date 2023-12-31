import { useState } from "react";
import axios from "axios";
import {
    Box,
    Button,
    TextField,
    useMediaQuery,
    Typography,
    useTheme,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LoadingButton from '@mui/lab/LoadingButton';
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "state";
import Dropzone from "react-dropzone";

const registerSchema = yup.object().shape({
    firstName: yup.string().required("required").min(2).max(50),
    lastName: yup.string().required("required").min(2).max(50),
    email: yup.string().email("invalid email").required("required").min(5),
    password: yup.string().required("required").min(5),
    location: yup.string(),
    occupation: yup.string(),
    picture: yup.string(),
});

const loginSchema = yup.object().shape({
    email: yup.string().email("invalid email").required("required"),
    password: yup.string().required("required"),
});

const initialValuesRegister = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    location: "",
    occupation: "",
    picture: "",
};

const initialValuesLogin = {
    email: "",
    password: "",
};


const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
            resolve(fileReader.result);
        };
        fileReader.onerror = (error) => {
            reject(error);
        };
    });
};

const Form = () => {
    const theme = useTheme();
    const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
    const [pageType, setPageType] = useState("login");
    const [autoFilled, setAutoFilled] = useState(0);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { palette } = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isNonMobile = useMediaQuery("(min-width:600px)");
    const isLogin = pageType === "login";
    const isRegister = pageType === "register";

    const register = async (values, onSubmitProps) => {
        try {
            setIsRegistering(true);
            let base64Image = '';
            if(values.picture) base64Image = await convertToBase64(values.picture);
            const newValues = {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: values.password,
                location: values.location,
                occupation: values.occupation,
                picture: base64Image,
            }
            
            const savedUserResponse = await axios.post(`${process.env.REACT_APP_URL}/auth/register`, JSON.stringify(newValues), {headers: {'Content-Type': 'application/json'}});
            const savedUser = savedUserResponse.data;
            setIsRegistering(false);
            onSubmitProps.resetForm();
            if (savedUser) {
                setPageType("login");
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    const login = async (values, onSubmitProps) => {
        try {
            setIsLoggingIn(true);
            const loggedInResponse = await axios.post(`${process.env.REACT_APP_URL}/auth/login`,
                                                    JSON.stringify(values),
                                                    {headers: {'Content-Type': 'application/json'}});
            const loggedIn = loggedInResponse.data;
            onSubmitProps.resetForm();
            setIsLoggingIn(false);
            if (loggedIn) {
                dispatch(
                    setLogin({
                        user: loggedIn.user,
                        token: loggedIn.token,
                    })
                );
                navigate("/home");
            }
        } catch (err) {
            setIsLoggingIn(false);
            console.log(err);
        }
    };

    const handleFormSubmit = async (values, onSubmitProps) => {
        try {
            if (isLogin) await login(values, onSubmitProps);
            if (isRegister) await register(values, onSubmitProps);
        } catch (err) {
            console.log(err);
        }
    };


    const autoFill = (values) => {
        if(isLoggingIn) return;
        values.email = 'hello@example.com';
        values.password = 'helloexample';
        setAutoFilled(autoFilled+1);
    }

    return (
    <Box
            width={isNonMobileScreens ? "30%" : "70%"}
            p="1rem 2rem"
            borderRadius="1.5rem"
            backgroundColor={theme.palette.background.alt}
            sx={{
                border: `1px solid black`,
                boxShadow: `0px 0px 10px grey`,
                margin: isNonMobileScreens ? `${isRegister?'0rem':'5rem'} auto 2rem auto` : "2rem auto",
            }}
        >
        <Typography fontWeight="500" variant="h5" sx={{ m: "1rem auto" }} align="center" fontSize='36px'>
            {isRegister ? "SIGN-UP" : "LOGIN"}
        </Typography>
        <Formik
            onSubmit={handleFormSubmit}
            initialValues={isLogin ? initialValuesLogin : initialValuesRegister}
            validationSchema={isLogin ? loginSchema : registerSchema}
        >
            {({
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
                handleSubmit,
                setFieldValue,
                resetForm,
            }) => (
            <form onSubmit={handleSubmit}>
                <Box
                    display='grid'
                    gap='11px'
                    gridTemplateColumns='repeat(4, minmax(0, 1fr))'
                    sx={{
                    '& > div': { gridColumn: isNonMobile ? undefined : 'span 4' },
                }}
                    >
                    {isRegister && (
                    <>
                        <TextField
                            label='First Name*'
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.firstName}
                            name='firstName'
s                            error={
                                Boolean(touched.firstName) && Boolean(errors.firstName)
                            }
                            helperText={touched.firstName && errors.firstName}
                            sx={{ 
                                gridColumn: 'span 2',
                            }}
                        />
                        <TextField
                            label='Last Name*'
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.lastName}
                            name='lastName'
                            error={Boolean(touched.lastName) && Boolean(errors.lastName)}
                            helperText={touched.lastName && errors.lastName}
                            sx={{ gridColumn: 'span 2' }}
                        />
                        <TextField
                            label='Location'
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.location}
                            name='location'
                            error={Boolean(touched.location) && Boolean(errors.location)}
                            helperText={touched.location && errors.location}
                            sx={{ gridColumn: 'span 4' }}
                        />
                        <TextField
                            label='Occupation'
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.occupation}
                            name='occupation'
                            error={
                                Boolean(touched.occupation) && Boolean(errors.occupation)
                            }
                            helperText={touched.occupation && errors.occupation}
                            sx={{ gridColumn: 'span 4' }}
                        />
                        <Box
                            gridColumn='span 4'
                            border={`1px solid ${palette.neutral.medium}`}
                            borderRadius='5px'
                            p='0.5rem'
                        >
                            <Dropzone
                                acceptedFiles='.jpg,.jpeg,.png'
                                multiple={false}
                                onDrop={(acceptedFiles) => setFieldValue("picture", acceptedFiles[0])}
                            >
                            {({ getRootProps, getInputProps }) => (
                                <Box
                                    {...getRootProps()}
                                    border={`2px dashed ${palette.primary.main}`}
                                    p="1rem"
                                    sx={{ 
                                        '&:hover': { cursor: 'pointer' },
                                        height: '50px', 
                                    }}
                                >
                                    <input {...getInputProps()} />
                                    {!values.picture ? (
                                        <p style={{margin: 'auto'}}>Add Picture Here</p>
                                    ) : (
                                        <>
                                        <Typography>{values.picture.name}</Typography>
                                        <EditOutlinedIcon />
                                        </>
                                        )}
                                </Box>
                            )}
                            </Dropzone>
                        </Box>
                    </>
                    )}

                    <TextField
                        label='Email*'
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.email}
                        name='email'
                        error={Boolean(touched.email) && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        sx={{ gridColumn: 'span 4' }}
                    />
                    <TextField
                        label='Password*'
                        type='password'
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.password}
                        name='password'
                        error={Boolean(touched.password) && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                        sx={{ gridColumn: 'span 4' }}
                    />
                </Box>

            {/* BUTTONS */}
                <Box>
                    {isLogin && <Button
                        onClick={autoFill.bind(this,values)}
                        sx={{
                            m: '2rem 0',
                            p: '1rem',
                            width: '45%',
                            backgroundColor: palette.primary.main,
                            color: palette.background.alt,
                            '&:hover': { color: palette.primary.main },
                        }}
                    >
                    Auto Fill
                    </Button>}
                    {isLogin && (!isLoggingIn ? <Button
                        type='submit'
                        sx={{
                            m: '2rem 0',
                            ml: '10%',
                            width: '45%',
                            p: '1rem',
                            backgroundColor: palette.primary.main,
                            color: palette.background.alt,
                            '&:hover': { color: palette.primary.main },
                        }}
                    >
                    Login
                    </Button> : 
                    <LoadingButton
                        loading
                        sx={{
                            m: '2rem 0',
                            ml: '10%',
                            width: '45%',
                            p: '1rem',
                        }}
                        loadingPosition="start"
                        variant="outlined"
                    >
                        Login
                    </LoadingButton>)
                    }
                    
                    {isRegister && (!isRegistering ? <Button
                        fullWidth
                        type='submit'
                        sx={{
                            m: '1.3rem 0',
                            p: '1rem',
                            backgroundColor: palette.primary.main,
                            color: palette.background.alt,
                            '&:hover': { color: palette.primary.main },
                        }}
                    >
                        Register
                    </Button> : 
                    <LoadingButton
                        fullWidth
                        sx={{
                            m: '1.3rem 0',
                            p: '1rem',
                        }}
                        loading
                        loadingPosition="start"
                        variant="outlined"
                    >
                        Register
                    </LoadingButton>)
                    }
                    <Typography
                        onClick={() => {
                            setPageType(isLogin ? 'register' : 'login');
                            resetForm();
                        }}
                        sx={{
                            textDecoration: 'underline',
                            color: palette.primary.main,
                            '&:hover': {
                            cursor: 'pointer',
                            color: palette.primary.light,
                            },
                        }}
                    >
                    {isLogin ? "Don't have an account? Sign Up here." : 'Already have an account? Login here.'}
                    </Typography>
                </Box>
            </form>
        )}
        </Formik>
    </Box>
  );
};

export default Form;