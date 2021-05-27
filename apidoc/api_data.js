define({ "api": [
  {
    "type": "delete",
    "url": "/auth",
    "title": "Request to delete a Pushy Token for the user",
    "name": "DeleteAuth",
    "group": "Auth",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "authorization",
            "description": "<p>Valid JSON Web Token JWT</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true when the pushy token is deleted</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "400: Missing Parameters": [
          {
            "group": "400: Missing Parameters",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Missing required information&quot;</p>"
          }
        ],
        "404: User Not Found": [
          {
            "group": "404: User Not Found",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;user not found&quot;</p>"
          }
        ],
        "400: JSON Error": [
          {
            "group": "400: JSON Error",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;malformed JSON in parameters&quot;</p>"
          }
        ],
        "400: SQL Error": [
          {
            "group": "400: SQL Error",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>the reported SQL error details</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/pushyregister.js",
    "groupTitle": "Auth"
  },
  {
    "type": "get",
    "url": "/auth",
    "title": "Request to sign a user in the system",
    "name": "GetAuth",
    "group": "Auth",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "authorization",
            "description": "<p>&quot;username:password&quot; uses Basic Auth</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true when the name is found and password matches</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Authentication successful!&quot;&quot;</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>JSON Web Token</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 201 OK\n{\n  \"success\": true,\n  \"message\": \"Authentication successful!\",\n  \"token\": \"eyJhbGciO...abc123\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "400: Missing Authorization Header": [
          {
            "group": "400: Missing Authorization Header",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Missing Authorization Header&quot;</p>"
          }
        ],
        "400: Malformed Authorization Header": [
          {
            "group": "400: Malformed Authorization Header",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Malformed Authorization Header (i.e. username and password)&quot;</p>"
          }
        ],
        "404: User Not Found": [
          {
            "group": "404: User Not Found",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;User not found&quot;</p>"
          }
        ],
        "401: Not verified": [
          {
            "group": "401: Not verified",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;User has not been verified&quot;</p>"
          }
        ],
        "400: Invalid Credentials": [
          {
            "group": "400: Invalid Credentials",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Credentials did not match&quot;</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/signin.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/auth",
    "title": "Request to register a user",
    "name": "PostAuth",
    "group": "Auth",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "first",
            "description": "<p>a users first name</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "last",
            "description": "<p>a users last name</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "email",
            "description": "<p>a users email *unique</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "password",
            "description": "<p>a users password</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "username",
            "description": "<p>a username *unique, if none provided, email will be used</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 201": [
          {
            "group": "Success 201",
            "type": "boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true when the name is inserted</p>"
          },
          {
            "group": "Success 201",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>the email of the user inserted</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "400: Missing Parameters": [
          {
            "group": "400: Missing Parameters",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Missing required information&quot;</p>"
          }
        ],
        "400: Username exists": [
          {
            "group": "400: Username exists",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Username exists&quot;</p>"
          }
        ],
        "400: Email exists": [
          {
            "group": "400: Email exists",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Email exists&quot;</p>"
          }
        ],
        "400: Other Error": [
          {
            "group": "400: Other Error",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;other error, see detail&quot;</p>"
          },
          {
            "group": "400: Other Error",
            "type": "String",
            "optional": false,
            "field": "detail",
            "description": "<p>Information about th error</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/register.js",
    "groupTitle": "Auth"
  },
  {
    "type": "put",
    "url": "/auth",
    "title": "Request to insert a Pushy Token for the user",
    "name": "PutAuth",
    "group": "Auth",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "authorization",
            "description": "<p>Valid JSON Web Token JWT</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>the Pushy Token of the user identified in the JWT</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true when the pushy token is inserted</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "400: Missing Parameters": [
          {
            "group": "400: Missing Parameters",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Missing required information&quot;</p>"
          }
        ],
        "404: User Not Found": [
          {
            "group": "404: User Not Found",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;user not found&quot;</p>"
          }
        ],
        "400: JSON Error": [
          {
            "group": "400: JSON Error",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;malformed JSON in parameters&quot;</p>"
          }
        ],
        "400: SQL Error": [
          {
            "group": "400: SQL Error",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>the reported SQL error details</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/pushyregister.js",
    "groupTitle": "Auth"
  },
  {
    "type": "put",
    "url": "/auth/changePassword",
    "title": "Request to change password",
    "name": "changePass",
    "group": "Auth",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "oldpassword",
            "description": "<p>previous password in body</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "newpassword",
            "description": "<p>new password in body</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 201": [
          {
            "group": "Success 201",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>success message when password has been changed</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "404: User not found": [
          {
            "group": "404: User not found",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;User does not exist&quot;</p>"
          }
        ],
        "401: Invalid Password": [
          {
            "group": "401: Invalid Password",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;oldpassword is invalid&quot;</p>"
          }
        ],
        "400: SQL Error": [
          {
            "group": "400: SQL Error",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;SQL error when attempting to update&quot;</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/password.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/auth/resetPassword",
    "title": "Change the password if forgotten, sends email with code",
    "name": "resetPass_Pt._1",
    "group": "Auth",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "email",
            "description": "<p>email of the user to reset</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 201": [
          {
            "group": "Success 201",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>success message that email was sent</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/password.js",
    "groupTitle": "Auth"
  },
  {
    "type": "put",
    "url": "/auth/resetPassword",
    "title": "Checks the code and password to update if valid code and password",
    "name": "resetPass_Pt._2",
    "group": "Auth",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "email",
            "description": "<p>email associated with account to reset</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "password",
            "description": "<p>new password to reset</p>"
          },
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "code",
            "description": "<p>to validate the correct user</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 201": [
          {
            "group": "Success 201",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>success message when password has been updated</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "400: SQL Error": [
          {
            "group": "400: SQL Error",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;SQL error when attempting to update&quot;</p>"
          }
        ],
        "400: Body Parameter": [
          {
            "group": "400: Body Parameter",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Missing body parameter&quot;</p>"
          }
        ],
        "404: User not found": [
          {
            "group": "404: User not found",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;User has not been found&quot;</p>"
          }
        ],
        "400: Code Errors": [
          {
            "group": "400: Code Errors",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>Multiple errors regarding code (e.g. invalid)</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/password.js",
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/chats/",
    "title": "Creates a chat with the given list of users, group name, and owner",
    "description": "<p>Creates a new chat provided the group name and list of user's memberid in an array</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Bearer",
            "description": "<p>Token a valid authorization JWT</p>"
          },
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "a",
            "description": "<p>valid auth jwt</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "[]",
            "optional": false,
            "field": "users",
            "description": "<p>an array of numbers representing the ids of members to be added (does not include self) NOTE: this is part of body, not param</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "groupname",
            "description": "<p>the name of the group, NOTE: this is part of body, not param</p>"
          }
        ]
      }
    },
    "name": "createChats",
    "group": "Chats",
    "error": {
      "fields": {
        "400: Missing Body Parameter": [
          {
            "group": "400: Missing Body Parameter",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>Either groupname or [...users...] is missing</p>"
          }
        ],
        "400: SQL Error": [
          {
            "group": "400: SQL Error",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>Something broke during querying DB</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "chatid",
            "optional": false,
            "field": "the",
            "description": "<p>chatid corresponding to the created chat</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/chats.js",
    "groupTitle": "Chats"
  },
  {
    "type": "get",
    "url": "/chats/",
    "title": "Gets a list chats with timestamp and last message that the user belongs to",
    "description": "<p>Gets a list of chats that the user belongs to by their id as well as the last message sent and the timestamp it was sent</p>",
    "name": "getChats",
    "group": "Chats",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "Bearer",
            "description": "<p>Token a valid authorization JWT</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "400: SQL Error": [
          {
            "group": "400: SQL Error",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>Something broke during querying DB</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "[]",
            "optional": false,
            "field": "chats",
            "description": "<p>an array of chats in json format</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "chats.chatid",
            "description": "<p>The id of the chat</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "chats.groupname",
            "description": "<p>The groupname of the chat</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "chats.lastmessage",
            "description": "<p>The message text last sent</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "chats.lasttimestamp",
            "description": "<p>The timestamp of the last message</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/chats.js",
    "groupTitle": "Chats"
  },
  {
    "type": "post",
    "url": "/request",
    "title": "handles accepting connection requests",
    "name": "FriendRequest",
    "group": "Contacts",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "int",
            "optional": false,
            "field": "the",
            "description": "<p>contact id that invited you</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 201": [
          {
            "group": "Success 201",
            "type": "boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true when you accepted their invite</p>"
          },
          {
            "group": "Success 201",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>the email of the user inserted</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "400: Missing Parameters": [
          {
            "group": "400: Missing Parameters",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Missing required information&quot;</p>"
          }
        ],
        "400: Other Error": [
          {
            "group": "400: Other Error",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;other error, see detail&quot;</p>"
          },
          {
            "group": "400: Other Error",
            "type": "String",
            "optional": false,
            "field": "detail",
            "description": "<p>Information about th error</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/requests.js",
    "groupTitle": "Contacts"
  },
  {
    "type": "get",
    "url": "/contacts",
    "title": "",
    "name": "GetContacts",
    "group": "Contacts",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "the",
            "description": "<p>user's memberID</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 201": [
          {
            "group": "Success 201",
            "type": "boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true when contacts are returned</p>"
          },
          {
            "group": "Success 201",
            "type": "JSONArray",
            "optional": false,
            "field": "JSON",
            "description": "<p>object with all of the contact information</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "400: Missing Parameters": [
          {
            "group": "400: Missing Parameters",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Missing required information&quot;</p>"
          }
        ],
        "404: No contacts found": [
          {
            "group": "404: No contacts found",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;You have no contacts&quot;</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/contacts.js",
    "groupTitle": "Contacts"
  },
  {
    "type": "get",
    "url": "/invites",
    "title": "Gets all possible users that member is not friends with",
    "name": "GetInvite",
    "group": "Invites",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "memberid_a",
            "description": "<p>the memberID of the requester</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "memberid_b",
            "description": "<p>the memberID of the user receiving the request</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true when the invite was sent</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/invites.js",
    "groupTitle": "Invites"
  },
  {
    "type": "post",
    "url": "/invites",
    "title": "Request to send an invite to another user",
    "name": "PostInvite",
    "group": "Invites",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "memberid_a",
            "description": "<p>the memberID of the requester</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "memberid_b",
            "description": "<p>the memberID of the user receiving the request</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 201": [
          {
            "group": "Success 201",
            "type": "boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true when the invite was sent</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "boolean",
            "optional": false,
            "field": "success",
            "description": "<p>when the other users contact list is updated as well</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/invites.js",
    "groupTitle": "Invites"
  },
  {
    "type": "get",
    "url": "/auth/verification",
    "title": "send the verification email again",
    "error": {
      "fields": {
        "400: Missing Authorization Header": [
          {
            "group": "400: Missing Authorization Header",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Missing Authorization Header&quot;</p>"
          }
        ],
        "400: Malformed Authorization Header": [
          {
            "group": "400: Malformed Authorization Header",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Malformed Authorization Header (i.e. username and password)&quot;</p>"
          }
        ],
        "404: User Not Found": [
          {
            "group": "404: User Not Found",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;User not found&quot;</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/signin.js",
    "group": "J:\\CS_Projects\\Javascript\\Team4TCSS450_Backend\\routes\\signin.js",
    "groupTitle": "J:\\CS_Projects\\Javascript\\Team4TCSS450_Backend\\routes\\signin.js",
    "name": "GetAuthVerification"
  },
  {
    "type": "get",
    "url": "/messages/:chatid?/:messageId?",
    "title": "Request to get chat messages",
    "name": "GetMessages",
    "group": "Messages",
    "description": "<p>Request to get the 10 most recent chat messages from the server in a given chat - chatid. If an optional messageId is provided, return the 10 messages in the chat prior to (and not including) the message containing MessageID.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "chatid",
            "description": "<p>the chat to look up.</p>"
          },
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "messageId",
            "description": "<p>(Optional) return the 15 messages prior to this message</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "rowCount",
            "description": "<p>the number of messages returned</p>"
          },
          {
            "group": "Success 200",
            "type": "object[]",
            "optional": false,
            "field": "messages",
            "description": "<p>List of massages in the message table</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "messages.messageId",
            "description": "<p>The id for this message</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "messages.email",
            "description": "<p>The email of the user who posted this message</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "messages.message",
            "description": "<p>The message text</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "messages.timestamp",
            "description": "<p>The timestamp of when this message was posted</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "404: ChatId Not Found": [
          {
            "group": "404: ChatId Not Found",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Chat ID Not Found&quot;</p>"
          }
        ],
        "400: Invalid Parameter": [
          {
            "group": "400: Invalid Parameter",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Malformed parameter. chatid must be a number&quot;</p>"
          }
        ],
        "400: Missing Parameters": [
          {
            "group": "400: Missing Parameters",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Missing required information&quot;</p>"
          }
        ],
        "400: SQL Error": [
          {
            "group": "400: SQL Error",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>the reported SQL error details</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/messages.js",
    "groupTitle": "Messages"
  },
  {
    "type": "post",
    "url": "/messages",
    "title": "Request to add a message to a specific chat",
    "name": "PostMessages",
    "group": "Messages",
    "description": "<p>Adds the message from the user associated with the required JWT.</p>",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "authorization",
            "description": "<p>Valid JSON Web Token JWT</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "chatid",
            "description": "<p>the id of th chat to insert this message into NOTE: in body, not param</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "message",
            "description": "<p>a message to store NOTE: in body, not param</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "[]",
            "optional": false,
            "field": "message",
            "description": "<p>an array of messages in json format (need to update with pushy)</p>"
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "message.messageid",
            "description": "<p>the id of the message</p>"
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "message.chatid",
            "description": "<p>the chat id the message bleongs to</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "message.message",
            "description": "<p>contents of the message</p>"
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "message.memberid",
            "description": "<p>who made the message</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "message.timestamp",
            "description": "<p>the time the message was sent</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "400: Unknown user": [
          {
            "group": "400: Unknown user",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;unknown email address&quot;</p>"
          }
        ],
        "400: Missing Parameters": [
          {
            "group": "400: Missing Parameters",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;Missing required information&quot;</p>"
          }
        ],
        "400: SQL Error": [
          {
            "group": "400: SQL Error",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>the reported SQL error details</p>"
          }
        ],
        "400: Unknown Chat ID": [
          {
            "group": "400: Unknown Chat ID",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>&quot;invalid chat id&quot;</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/messages.js",
    "groupTitle": "Messages"
  },
  {
    "type": "get",
    "url": "/weather",
    "title": "Request a list of Phish.net Blogs",
    "name": "GetOpenWeatherMapGet",
    "group": "OpenWeatherMap",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "string",
            "optional": false,
            "field": "authorization",
            "description": "<p>JWT provided from Auth get</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "lat",
            "description": "<p>location's latitude</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "lon",
            "description": "<p>location's longitude</p>"
          }
        ]
      }
    },
    "description": "<p>This end point is a pass through to the Phish.net API. All parameters will pass on to https://api.openweathermap.org/data/2.5/onecall. See the <a href=\"https://openweathermap.org/api/one-call-api\"> openweathermap.org documentation</a> for a list of optional paramerters and expected results. You do not need a openweathermap.org api key with this endpoint. Enjoy!</p>",
    "version": "0.0.0",
    "filename": "routes/weather.js",
    "groupTitle": "OpenWeatherMap"
  },
  {
    "type": "get",
    "url": "/requuests",
    "title": "Gets all pending friend requests",
    "name": "GetRequests",
    "group": "Requests",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "boolean",
            "optional": false,
            "field": "success",
            "description": "<p>true when the invite was sent</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/requests.js",
    "groupTitle": "Requests"
  },
  {
    "type": "get",
    "url": "/verification",
    "title": "Request to verify a user",
    "name": "GetVerification",
    "group": "Verification",
    "query": [
      {
        "group": "Query",
        "type": "string",
        "optional": false,
        "field": "the",
        "description": "<p>salt that is linked to the user</p>"
      }
    ],
    "success": {
      "fields": {
        "Success 201": [
          {
            "group": "Success 201",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>to indicate user x has been verified</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "400: Salt Error": [
          {
            "group": "400: Salt Error",
            "optional": false,
            "field": "Salt",
            "description": "<p>is incorrect or does not exist</p>"
          }
        ],
        "400: Name Missing Error": [
          {
            "group": "400: Name Missing Error",
            "optional": false,
            "field": "Name",
            "description": "<p>is missing from the query</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/verify.js",
    "groupTitle": "Verification"
  }
] });
