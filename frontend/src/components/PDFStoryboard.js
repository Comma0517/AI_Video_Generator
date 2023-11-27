const PDFStoryboard = (props) => {
    return (
      <div>
        <p style={{ fontSize: "24px", color: "#007BFF", fontWeight: "bold" }}>Title: Video script template</p>
        <div className='table-responsive'>
          <table className="table">
            <thead style={{ backgroundColor: "#007BFF", color: "#ffffff" }}>
              <tr>
                <th style={{ textAlign: "center", width: "10%" }}>Scene</th>
                <th style={{ textAlign: "center", width: "45%" }}>Narration</th>
                <th style={{ textAlign: "center", width: "35%" }}>Visuals</th>
              </tr>
            </thead>
            <tbody>
              {props.data.map((list, index) =>
                <tr key={index + 1} style={{ backgroundColor: "#f8f9fa" }}>
                  <td style={{ textAlign: "center", fontSize: "12px", color: "black", width: "10%" }}>{index + 1}</td>
                  <td style={{ textAlign: "center", fontSize: "12px", color: "black", width: "45%" }}>{list.audio}</td>
                  <td style={{ textAlign: "center", fontSize: "12px", color: "black", width: "35%" }}>
                    {/* Assuming list.visual is a string URL to the image */}
                    <img src="sample.jpg" alt={`Visuals for scene ${index + 1}`} style={{ maxWidth: "100%", height: "auto" }} />
                    <p style={{ margin: 0 }}>{list.visual}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  export default PDFStoryboard;