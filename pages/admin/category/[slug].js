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

const Update = ({ oldCategory, token }) => {
  const [state, setState] = useState({
    name: oldCategory.name,
    error: "",
    success: "",
    buttonText: 'Update',
    imagePreview: oldCategory.image.url,
    image: ''
  });

  const {
    name,
    error,
    image,
    success,
    buttonText,
    imagePreview,
  } = state;

  const [content, setContent] = useState(oldCategory.content)
  const [imageUploadBtnName, setImageUploadBtnName] = useState('Update image')

  const handleChange = (name) => (e) => {

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
    setState({ ...state, buttonText: "Updating" });

    try {
      const res = await axios.put(`${API}/category/${oldCategory.slug}`, { name, content, image }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("CATEGORY UPDATE RESPONSE", res);

      setState({
        ...state,
        imagePreview: res.data.image.url,
        success: `${res.data.name} is updated`,
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

  const updateCategoryForm = () => (
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
          {imageUploadBtnName}{' '}
          <span>
            <img src={imagePreview} alt="image" height="20" />
          </span>
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
          <h1>Update category</h1>
          <br />
          {success && showSuccessMessage(success)}
          {error && showErrorMessage(error)}
          {updateCategoryForm()}
        </div>
      </div>
    </Layout>
  );
};

Update.getInitialProps = async ({ req, query, token }) => {
  const res = await axios.post(`${API}/category/${query.slug}`)
  return { oldCategory: res.data.category, token }
}

export default withAdmin(Update);
