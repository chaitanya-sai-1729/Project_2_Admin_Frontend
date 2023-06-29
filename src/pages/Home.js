import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

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


const center = { lat: 12.839977, lng: 77.6644473 };

function Home() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [routes, setRoutes] = useState([]);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState({});


  useEffect(() => {
    Axios.get("https://project-2-backend-ten.vercel.app/admin")
      .then((res) => {
        const usersData = res.data;
        setUsers(usersData);
      })
      .catch((error) => {
        console.log("Error fetching users:", error);
      });

    console.log(selectedAttributes);
    console.log(routes);

  }, []);

  useEffect(() => {
    const getRoutes = async () => {
      const routesData = [];

      for (const user of filteredUsers) {
        const selectedUserRoutes = [];

        for (const attribute of selectedAttributes[user._id]) {
          if (Array.isArray(user[attribute])) {
            const locations = user[attribute].map((obj) => [obj.latitude, obj.longitude]);

            try {
              const userRoutes = await fetchRoutes(locations);
              selectedUserRoutes.push(...userRoutes);
            } catch (error) {
              console.log("Error fetching routes:", error);
            }
          }
        }

        routesData.push(selectedUserRoutes);
      }

      setRoutes(routesData);
    };

    if (selectedUsers.length > 0 && Object.keys(selectedAttributes).length > 0) {
      getRoutes();
    }
  }, [selectedUsers, selectedAttributes]);

  const fetchRoutes = async (locations) => {
    const apiKey = '5b3ce3597851110001cf62489e0738b35da0487da467da5c9b5d369f';
    const promises = [];

    for (let i = 0; i < locations.length - 1; i++) {
      const startPoint = locations[i];
      const endPoint = locations[i + 1];
      const url = `https://api.openrouteservice.org/v2/directions/cycling-regular?api_key=${apiKey}&start=${startPoint[1]},${startPoint[0]}&end=${endPoint[1]},${endPoint[0]}`;
      promises.push(fetch(url).then((response) => response.json()));
    }

    try {
      return await Promise.all(promises);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const customIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: null,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });

  const handleMarkerClick = () => { };

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

  const handleAttributeSelection = (attribute, userId) => {
    const updatedSelectedAttributes = { ...selectedAttributes };

    if (!updatedSelectedAttributes[userId]) {
      updatedSelectedAttributes[userId] = [];
    }

    const userSelectedAttributes = updatedSelectedAttributes[userId];
    const index = userSelectedAttributes.indexOf(attribute);

    if (index > -1) {
      userSelectedAttributes.splice(index, 1); // Uncheck the attribute
    } else {
      userSelectedAttributes.push(attribute); // Check the attribute
    }

    setSelectedAttributes(updatedSelectedAttributes);
  };

  const isAttributeSelected = (attribute, userId) => {
    if (selectedAttributes[userId]) {
      return selectedAttributes[userId].includes(attribute);
    }
    return false;
  };

  const filteredUsers = users
    .filter((user) => selectedUsers.includes(user._id))
    .map((user) => {
      const attributes = Object.keys(user).filter((key) => key !== "_id");
      const selectedAttributes = attributes.filter((attribute) =>
        isAttributeSelected(attribute, user._id)
      );
      const locations = [];

      selectedAttributes.forEach((attribute) => {
        if (Array.isArray(user[attribute])) {
          const userLocations = user[attribute].map((obj) => ({
            lat: obj.latitude,
            lng: obj.longitude,
          }));
          locations.push(...userLocations);
        }
      });

      return { ...user, locations };
    });

  const getFilteredLocations = () => {
    const filteredLocations = [];

    filteredUsers.forEach((user) => {
      selectedAttributes[user._id]?.forEach((attribute) => {
        if (user[attribute] && Array.isArray(user[attribute])) {
          user[attribute].forEach((obj, index) => {
            if (obj.latitude && obj.longitude) {
              const markerTitle = `${user._id}-${attribute}-${index}`;
              filteredLocations.push(
                <Marker
                  key={markerTitle}
                  position={[obj.latitude, obj.longitude]}
                  title={markerTitle}
                  icon={customIcon} // Use customIcon for the marker
                  eventHandlers={{ click: handleMarkerClick }}
                />
              );
            }
          });
        }
      });
    });

    return filteredLocations;
  };

  const getRoutePolylines = () => {
    const routePolylines = [];

    routes.forEach((userRoutes) => {
      userRoutes.forEach((route) => {
        const coordinates = route.features[0].geometry.coordinates;
        const positions = coordinates.map(([lng, lat]) => [lat, lng]);

        routePolylines.push(
          <Polyline key={route.id} positions={positions} color="blue" />
        );
      });
    });
    console.log(routePolylines);
    return routePolylines;
  };

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
          <HStack spacing={4} ml="auto" mr="10px" position="relative" zIndex="999">
            <Menu>
              <MenuButton as={IconButton} icon={<Avatar />} variant="outline" zIndex="999" />
              <MenuList>
                <MenuItem onClick={openProfile}>Select</MenuItem>
                <MenuItem onClick={() => navigate("/")}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        <Box flex="1">
          <MapContainer center={center} zoom={13} style={{ height: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {getFilteredLocations()}
            {getRoutePolylines()}
          </MapContainer>
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
            <AlertDialogHeader>Select the Users and Attributes to be shown</AlertDialogHeader>
            <AlertDialogBody>
              {users.map((user) => (
                <Box key={user._id}>
                  <Checkbox
                    isChecked={selectedUsers.includes(user._id)}
                    onChange={() => handleUserSelection(user)}
                  >
                    {user._id}
                  </Checkbox>
                  {selectedUsers.includes(user._id) && (
                    <Flex ml={6} flexWrap="wrap">
                      {Object.keys(user).map((key) => {
                        if (key !== "_id") {
                          return (
                            <Checkbox
                              key={key}
                              isChecked={isAttributeSelected(key, user._id)}
                              onChange={() => handleAttributeSelection(key, user._id)}
                              ml={4}
                            >
                              {key}
                            </Checkbox>
                          );
                        }
                        return null;
                      })}
                    </Flex>
                  )}
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
