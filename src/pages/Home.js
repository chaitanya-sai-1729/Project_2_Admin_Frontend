import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import {
  Box,
  ChakraProvider,
  Flex,
  IconButton,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  Checkbox,
} from "@chakra-ui/react";
import { HiMenu } from "react-icons/hi";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const center = { lat: 12.839977, lng: 77.6644473 };

function Home() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    Axios.get("https://project-2-backend-ten.vercel.app/admin")
      .then((res) => {
        const usersData = res.data;
        console.log(usersData);
        setUsers(usersData);
      })
      .catch((error) => {
        console.log("Error fetching users:", error);
      });
  }, []);

  if (!isLoaded) {
    return <div>Loading....</div>;
  }

  const handleMarkerClick = () => {};

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  const openProfile = () => {
    setIsProfileOpen(true);
  };

  const handleUserSelection = (user) => {
    const updatedSelectedUsers = [...selectedUsers];
    const index = updatedSelectedUsers.indexOf(user._id);

    if (index > -1) {
      updatedSelectedUsers.splice(index, 1); // Uncheck the user
    } else {
      updatedSelectedUsers.push(user._id); // Check the user
    }

    setSelectedUsers(updatedSelectedUsers);
  };

  const filteredUsers = users.filter((user) => selectedUsers.includes(user._id));

  return (
    <ChakraProvider>
      <Flex direction="column" h="100vh">
        <Flex bg="white" height="60px" p={4} align="center">
          <Box
            w="40px"
            h="40px"
            bg={`url("https://static.vecteezy.com/system/resources/previews/020/336/393/original/tvs-logo-tvs-icon-transparent-png-free-vector.jpg")`}
            bgSize="cover"
            borderRadius="full"
          />
          <HStack spacing={4} ml="auto" mr="10px">
            <Menu >
              <MenuButton  as={IconButton} icon={<Avatar />} variant="outline" />
              <MenuList>
                <MenuItem onClick={openProfile}>Select</MenuItem>
                <MenuItem onClick={() => navigate("/")}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        <Box flex="1">
          {isLoaded && (
            <GoogleMap
              center={center}
              zoom={15}
              mapContainerStyle={{ width: "100%", height: "100%" }}
            >
              {filteredUsers.map((user) => (
                <Marker
                  key={user._id}
                  position={{ lat: user.latitude, lng: user.longitude }}
                  title={user._id}
                  onClick={handleMarkerClick}
                />
              ))}
            </GoogleMap>
          )}
        </Box>
        <Flex bg="white" p={4} height="60px" align="center" justify="space-between">
          <Box>&copy; TVS Motor Company. All Rights Reserved.</Box>
          <Box>
            <a href="https://www.tvsmotor.com/">Website</a> |{" "}
            <a href="https://www.instagram.com/tvsmotorcompany/">Instagram</a> |{" "}
            <a href="https://www.youtube.com/channel/UCmXFdsJtTAbbYrH7zz-lkkw?sub_confirmation=1">YouTube</a>
          </Box>
        </Flex>
        <AlertDialog
          isOpen={isProfileOpen}
          leastDestructiveRef={undefined}
          onClose={closeProfile}
          motionPreset="slideInBottom"
        >
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader>Select the Users to be shown</AlertDialogHeader>
            <AlertDialogBody>
              {users.map((user) => (
                <Box key={user._id}>
                  <Checkbox
                    defaultChecked={selectedUsers.includes(user._id)}
                    onChange={() => handleUserSelection(user)}
                  >
                    {user._id}
                  </Checkbox>
                </Box>
              ))}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={closeProfile}>Select</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Flex>
    </ChakraProvider>
  );
}

export default Home;
