

import React, { useState, useEffect } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Modal
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: theme.spacing(4)
  },
  card: {
    cursor: "pointer"
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "pink"
  }
}));

function FbdTask() {
  const classes = useStyles();
  const [launches, setLaunches] = useState([]);
  const [filteredLaunches, setFilteredLaunches] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLaunch, setSelectedLaunch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    upcoming: false,
    past: false,
    success: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.spacexdata.com/v3/launches"
        );
        setLaunches(response.data);
        setFilteredLaunches(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filterLaunches = () => {
      let filteredData = [...launches];

      if (filterOptions.upcoming) {
        const currentDate = new Date();
        filteredData = filteredData.filter((launch) => {
          const launchDate = new Date(launch.launch_date_local);
          return launchDate > currentDate;
        });
      }

      if (filterOptions.past) {
        const currentDate = new Date();
        filteredData = filteredData.filter((launch) => {
          const launchDate = new Date(launch.launch_date_local);
          return launchDate < currentDate;
        });
      }

      if (filterOptions.success) {
        filteredData = filteredData.filter((launch) => {
          return launch.launch_success;
        });
      }

      setFilteredLaunches(filteredData);
    };

    filterLaunches();
  }, [launches, filterOptions]);

  const handleLaunchClick = (launch) => {
    setSelectedLaunch(launch);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedLaunch(null);
    setModalOpen(false);
  };

  const handleFilterChange = (event) => {
    setFilterOptions({
      ...filterOptions,
      [event.target.name]: event.target.checked
    });
  };

  return (
    <Container className={classes.root}>
      <Typography variant="h3" align="center" gutterBottom>
        SpaceX Launches
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <label>
                <input
                  type="checkbox"
                  name="upcoming"
                  checked={filterOptions.upcoming}
                  onChange={handleFilterChange}
                />
                Upcoming
              </label>
            </Grid>
            <Grid item>
              <label>
                <input
                  type="checkbox"
                  name="past"
                  checked={filterOptions.past}
                  onChange={handleFilterChange}
                />
                Past
              </label>
            </Grid>
            <Grid item>
              <label>
                <input
                  type="checkbox"
                  name="success"
                  checked={filterOptions.success}
                  onChange={handleFilterChange}
                />
                Success
              </label>
            </Grid>
          </Grid>
        </Grid>
        {loading ? (
          <Typography variant="body1">Loading...</Typography>
        ) : filteredLaunches.length === 0 ? (
          <Typography variant="body1">No launches found.</Typography>
        ) : (
          filteredLaunches.map((launch) => (
            <Grid key={launch.flight_number} item xs={12} sm={6} md={4}>
              <Card
                className={classes.card}
                onClick={() => handleLaunchClick(launch)}
              >
                <CardContent>
                  <Typography variant="h5" component="h2">
                    {launch.mission_name}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {new Date(launch.launch_date_local).toLocaleString()}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {launch.rocket.rocket_name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {selectedLaunch && (
        <Modal
          className={classes.modal}
          open={modalOpen}
          onClose={handleModalClose}
        >
          <div>
            <Typography variant="h5" gutterBottom>
              {selectedLaunch.mission_name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Launch Date:{" "}
              {new Date(selectedLaunch.launch_date_local).toLocaleString()}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Rocket Name: {selectedLaunch.rocket.rocket_name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Launch Site: {selectedLaunch.launch_site.site_name_long}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {selectedLaunch.details}
            </Typography>
          </div>
        </Modal>
      )}
    </Container>
  );
}

export default FbdTask;
