$(document).ready(function(){
  var config = {
   apiKey: "AIzaSyCnsOIMw2Ib5saHPN9SSOitsWzVNuBI1wI",
   authDomain: "test01-61e42.firebaseapp.com",
   databaseURL: "https://test01-61e42.firebaseio.com",
   storageBucket: "test01-61e42.appspot.com",
   messagingSenderId: "120526420747"
 };
  firebase.initializeApp(config);
  var dbChatRoom = firebase.database().ref().child('chatroom');
  var dbUser = firebase.database().ref().child('user');
  var dbRef = firebase.database().ref();

  var photoURL;
  var $img = $('img');

  const $messageField = $('#messageInput');
  const $messageList = $('#example-messages');

  const $email = $('#email');
  const $password = $('#password');
  const $btnSignIn = $('#btnSignIn');
  const $btnSignUp = $('#btnSignUp');
  const $btnSignOut = $('#btnSignOut');
  const $signInfo = $('#sign-info');
  const $btnSubmit = $('#btnSubmit');

  const $file = $('#file');
  const $profileName = $('#profile-name');
  const $profileEmail = $('#profile-email');
  const $profileocc = $('#profile-occ');
  const $profileage = $('#profile-age');
  const $profiledes = $('#profile-des');

  const $occupation = $('#occupation');
  const $age = $('#age');
  const $descriptions = $('#descriptions');


  var storageRef = firebase.storage().ref();

  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];

    var metadata = {
      'contentType': file.type
    };

    // Push to child path.
      // [START oncomplete]
      storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
        console.log('Uploaded', snapshot.totalBytes, 'bytes.');
        console.log(snapshot.metadata);
        photoURL = snapshot.metadata.downloadURLs[0];
        console.log('File available at', photoURL);
      }).catch(function(error) {
        // [START onfailure]
        console.error('Upload failed:', error);
        // [END onfailure]
      });
      // [END oncomplete]
    }

    window.onload = function() {
      $file.change(handleFileSelect);
      // $file.disabled = false;
    };

  // SignIn/SignUp/SignOut Button status
  var user = firebase.auth().currentUser;
  if (user) {
    $btnSignIn.attr('disabled', 'disabled');
    $btnSignOut.removeAttr('disabled');
    $btnSignOut.removeAttr('disabled');
  } else {
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled');
    $btnSignUp.removeAttr('disabled');
  };

  // SignIn
  $btnSignIn.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signIn
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(){
      console.log('SignIn User');
    });
  });

  // SignUp
  $btnSignUp.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signUp
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(user){
      console.log("SignUp user is "+user.email);
      const dbUserid = dbUser.child(user.uid);
      //dbUserid.push({email:user.email});
    });
  });

  // Listening Login User
  firebase.auth().onAuthStateChanged(function(user){
    var use = firebase.auth().currentUser;
    if(user) {
      console.log(user);
      const loginName = user.displayName || user.email;
      const dbUserid = dbUser.child(user.uid);
      var $occu = dbUserid.child('Occupation');
      var $age = dbUserid.child('Age');
      var $des = dbUserid.child('Descriptions');

      $signInfo.html(loginName+" is login...");
      $btnSignIn.attr('disabled', 'disabled');
      $btnSignUp.attr('disabled', 'disabled');
      $btnSignOut.removeAttr('disabled')
      $profileName.html(user.displayName);
      $profileEmail.html(user.email);
      $img.attr("src",user.photoURL);

      $occu.on('value', function(snap){
       $profileocc.html(snap.val());
     });
     $age.on('value', function(snap){
       $profileage.html(snap.val());
     });
     $des.on('value', function(snap){
       $profiledes.html(snap.val());
     });

    } else {
      console.log("not logged in");
      $profileName.html("N/A");
      $profileEmail.html('N/A');
      $profileocc.html('N/A');
      $profileage.html('N/A');
      $profiledes.html('N/A')
      $img.attr("src","");
    }
  });

  // Signout
  $btnSignOut.click(function(){
    firebase.auth().signOut();
    console.log('LogOut');
    $signInfo.html('No one login...');
    $btnSignOut.attr('disabled', 'disabled');
    $btnSignIn.removeAttr('disabled');
    $btnSignUp.removeAttr('disabled');
    $messageList.empty();
    location.reload();
  });



  // Submit
    $btnSubmit.click(function(){
      const user = firebase.auth().currentUser;
      const $userName = $('#userName').val();

      const dbUserid = dbUser.child(user.uid);
      var occ = $occupation.val();
      var age = $age.val();
      var des = $descriptions.val();
      dbUserid.set({
        Age: age,
        Occupation: occ,
        Descriptions: des
      });
      if($occupation != ""){
      $occupation.on('value', function(snap){
        $profileocc.html(snap.val());
      });}
      if($age != ""){
      $age.on('value', function(snap){
        $profileage.html(snap.val());
      });}
      if($descriptions != ""){
      $descriptions.on('value', function(snap){
        $profiledes.html(snap.val());
      });}

      const promise = user.updateProfile({
        displayName: $userName,
        photoURL: photoURL
      });

      promise.then(function() {
        console.log("Update successful.");
        user = firebase.auth().currentUser;
        if (user) {
          $profileName.html(user.displayName);
          $profileEmail.html(user.email);
          $img.attr("src",user.photoURL);
          const loginName = user.displayName || user.email;
          $signInfo.html(loginName+" is login...");
          location.reload();
        }
      });
    });

    // LISTEN FOR KEYPRESS EVENT

firebase.auth().onAuthStateChanged(function(user){
    if(user){
    var use = firebase.auth().currentUser;
    const dbUserid = dbUser.child(use.uid);
    $messageField.keypress(function (e) {
      if (e.keyCode == 13) {
        //FIELD VALUES
        var username = use.displayName;
        var message = $messageField.val();
        var picture = use.photoURL;
        console.log(username);
        console.log(message);

        //SAVE DATA TO FIREBASE AND EMPTY FIELD
        dbChatRoom.push({name:username, text:message, pic:picture, user:user.uid});
        $messageField.val('');
      }
    });

    dbChatRoom.limitToLast(10).on('child_added', function (snapshot) {

      var use = firebase.auth().currentUser;
      //GET DATA
      var data = snapshot.val();
      var username = data.name || "anonymous";
      var message = data.text;
      var pic = data.pic;
      var thisid = user.uid;

      //CREATE ELEMENTS MESSAGE & SANITIZE TEXT

      var $messageElement = $("<li>");
      var $nameElement = $("<strong class='example-chat-username'></strong>");

      if(thisid == data.user){
        $messageElement.addClass("floatR");
        $nameElement.addClass("floatR");
        $nameElement.text(username).append($('<img>',{class:'chatimg floatR',src:data.pic}));
        $messageElement.text(message).append($nameElement);
      }else{
        $nameElement.text(username).prepend($('<img>',{class:'chatimg',src:data.pic}));
        $messageElement.text(message).prepend($nameElement);
      }

      //ADD MESSAGE
      $messageList.append($messageElement);

      //SCROLL TO BOTTOM OF MESSAGE LIST
      $messageList[0].scrollTop = $messageList[0].scrollHeight;
      });
    }
  });
});
