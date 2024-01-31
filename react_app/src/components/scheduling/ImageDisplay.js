import React, { useState, useEffect } from 'react';

const ImageDisplay = ({ imageUrl }) => {
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    // Create an image element to check if the URL returns an image
    const img = new Image();
    img.onload = () => {
      setIsImage(true);
    };
    img.onerror = () => {
      setIsImage(false);
    };
    img.src = imageUrl;

    // Clean up the image element
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  return (
    <div>
      {isImage && <img style={{height:'100%',width:'2em',aspectRatio:1,verticalAlign:'center'}} src={imageUrl} alt="Image" />}
    </div>
  );
};

export default ImageDisplay;