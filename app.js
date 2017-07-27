function addStudent() {
  if (event.which === 13 && event.target.value.length) {
    toggleDisplayInstructions();

    let name = document.querySelector("#nameInput").value;
    let newStudent = {
      name: name,
      selected: false
    };
    document.querySelector("#nameInput").value = "";

    axios
      .post(
        "https://api.mlab.com/api/1/databases/student-parking/collections/students?apiKey=A5IO96JcBWreeUT-8RrsJ_mQnCT8YoJi",
        newStudent
      )
      .then(function(response) {
        if (response.data._id) {
          alert(
            "You have been adding to the drawing. Please only submit your name once. If there has been an Error, please talk to Tanner."
          );
        }
      })
      .catch(function(err) {
        alert("There was an ERROR", err, "Please let Tanner Know");
      });
  }
}

function toggleDisplayInstructions() {
  let instructions = document.querySelector(".instructions");
  let style = instructions.style;
  style.display === "none"
    ? (style.display = "inherit")
    : (style.display = "none");
}

function displaySelectedStudents(recipientsArray) {
  console.log("recipientsArray: ", recipientsArray);
  let recipientDisplay = document.querySelector(".recipientDisplay");
  recipientDisplay.innerHTML = "";
  if (!recipientsArray.length) {
    let newRecipient = document.createElement("h2");
    newRecipient.classList.add("recipient");
    newRecipient.textContent = "No Passes Assigned (yet).";
    recipientDisplay.appendChild(newRecipient);
  }
  recipientsArray.forEach(function(recipient, index) {
    let newRecipient = document.createElement("h2");
    newRecipient.classList.add("recipient");
    newRecipient.textContent = recipient.name;
    recipientDisplay.appendChild(newRecipient);
  });
}

function getSelectedStudents() {
  axios
    .get(
      'https://api.mlab.com/api/1/databases/student-parking/collections/students?q={"selected":true}&apiKey=A5IO96JcBWreeUT-8RrsJ_mQnCT8YoJi'
    )
    .then(function(response) {
      let recipients = response.data;
      displaySelectedStudents(recipients);
    });
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getNewStudents() {
  let selectedStudents = [];
  axios
    .get(
      'https://api.mlab.com/api/1/databases/student-parking/collections/students?q={"selected": true}&apiKey=A5IO96JcBWreeUT-8RrsJ_mQnCT8YoJi'
    )
    .then(response => {
      students = response.data;
      return students;
    })
    .then(previousSelectedStudents => {
      let studentDeletes = [];
      previousSelectedStudents.forEach(student => {
        studentDeletes.push(
          axios.delete(
            `https://api.mlab.com/api/1/databases/student-parking/collections/students/${student
              ._id.$oid}?apiKey=A5IO96JcBWreeUT-8RrsJ_mQnCT8YoJi`,
            JSON.stringify([])
          )
        );
      });
      return Promise.all(studentDeletes);
    })
    .then(() => {
      return axios.get(
        "https://api.mlab.com/api/1/databases/student-parking/collections/students?apiKey=A5IO96JcBWreeUT-8RrsJ_mQnCT8YoJi"
      );
    })
    .then(students => {
      students = students.data;
      for (var i = 0; i < 2; i++) {
        let index = getRandomArbitrary(0, students.length);
        selectedStudents.push(students[index]);
        students.splice(index, 1);
      }
      return selectedStudents;
    })
    .then(newSelectedStudents => {
      let studentUpdates = [];
      newSelectedStudents.forEach(student => {
        student.selected = true;
        studentUpdates.push(
          axios.put(
            `https://api.mlab.com/api/1/databases/student-parking/collections/students/${student
              ._id.$oid}?apiKey=A5IO96JcBWreeUT-8RrsJ_mQnCT8YoJi`,
            student
          )
        );
      });
      return Promise.all(studentUpdates);
    })
    // .then(()=>{})
    .then(students => {
      students = students.map(student => student.data);
      displaySelectedStudents(students);
    });
}
