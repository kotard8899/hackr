import { decode } from "jsonwebtoken";
import Layout from "../../../components/Layout";
import withAdmin from "../../withAdmin";
import Resizer from 'react-image-file-resizer';
import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../../config";
import { showSuccessMessage, showErrorMessage } from "../../../helpers/alerts";
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.bubble.css'

const Create = ({ user, token }) => {
  const [state, setState] = useState({
    name: "",
    error: "",
    success: "",
    // formData: process.browser && new FormData(),
    buttonText: "Create",
    image: ''
  });

  const {
    name,
    error,
    image,
    success,
    buttonText,
  } = state;

  const [content, setContent] = useState('')
  const [imageUploadBtnName, setImageUploadBtnName] = useState('Upload image')

  const handleChange = (name) => (e) => {
    // const value = name === "image" ? e.target.files[0] : e.target.value;
    // const imageName = name === "image" ? e.target.files[0].name : "Upload image";

    // formData.set(name, value);

    setState({
      ...state,
      [name]: e.target.value,
      error: "",
      success: "",
    });
  };

  const handleContent = e => {
    setContent(e)
    setState({ ...state, success: '', error: '' })
  }

  const handleImage = (event) => {
    let fileInput = false
    if(event.target.files[0]) {
        fileInput = true
    }

    setImageUploadBtnName(event.target.files[0].name)

    if(fileInput) {
      try {
        Resizer.imageFileResizer(
          event.target.files[0],
          300,
          300,
          'JPEG',
          100,
          0,
          uri => {
              setState({ ...state, image: uri, success: '', error: '' })
          },
          'base64',
          200,
          200,
        );
      } catch(err) {
        console.log(err)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState({ ...state, buttonText: "Creating" });

    try {
      const res = await axios.post(`${API}/category`, { name, content, image }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("CATEGORY CREATE RESPONSE", res);
      setImageUploadBtnName('Upload image')

      setContent('')
      setState({
        ...state,
        name: "",
        formData: "",
        buttonText: "Created",
        imageUploadText: "Upload image",
        success: `${res.data.name} is created`,
      });
    } catch (err) {
      console.log("CATEGORY CREATE ERROR", err);
      setState({
        ...state,
        buttonText: "Create",
        error: err.response.data.error,
      });
    }
  };

  const createCategoryForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="text-muted">Name</label>
        <input
          onChange={handleChange("name")}
          value={name}
          type="text"
          className="form-control"
          required
        />
      </div>
      <div className="form-group">
        <label className="text-muted">Content</label>
        <ReactQuill
          onChange={handleContent}
          value={content}
          placeholder="Write something..."
          className="pb-5 mb-3"
          style={{ border: '1px solid #666' }}
          theme="bubble"
        />
      </div>
      <div className="form-group">
        <label className="btn btn-outline-secondary">
          {imageUploadBtnName}
          <input
            onChange={handleImage}
            type="file"
            accept="image/*"
            className="form-control"
            hidden
          />
        </label>
      </div>
      <div>
        <button className="btn btn-outline-warning">{buttonText}</button>
      </div>
    </form>
  );

  return (
    <Layout>
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <h1>Create category</h1>
          <br />
          {success && showSuccessMessage(success)}
          {error && showErrorMessage(error)}
          {createCategoryForm()}
        </div>
      </div>
    </Layout>
  );
};

export default withAdmin(Create);
