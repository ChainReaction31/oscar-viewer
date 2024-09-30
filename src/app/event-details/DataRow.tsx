"use client";

import { IEventTableData, SelectedEventOcc } from "types/new-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import {styled} from "@mui/material/styles";
import React, {useState} from "react";
import {useSelector} from "react-redux";
import {selectEventPreview} from "@/lib/state/OSCARClientSlice";


const StatusTableCell = styled(TableCell)(({theme, status }: {theme: any, status: string }) => ({
  color: status === 'Gamma' ? theme.palette.error.contrastText : status === 'Neutron' ? theme.palette.info.contrastText : status === 'Gamma & Neutron' ? theme.palette.secondary.contrastText : 'inherit',
  backgroundColor: status === 'Gamma' ? theme.palette.error.main : status === 'Neutron' ? theme.palette.info.main : status === 'Gamma & Neutron' ? theme.palette.secondary.main : 'transparent',
}));


export default function DataRow() {

  const eventPreview = useSelector(selectEventPreview);
  const eventData: IEventTableData = eventPreview.eventData;

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow  sx={{ '&:last-child td, &:last-child th': { border: 0, textAlign: "center", fontWeight: "bold" } }}>
            {/* <FormControlLabel control={<Checkbox name="secondaryInspection" checked={secondaryInspection} onChange={handleChange}/>} />*/}
            <TableCell align="center">Secondary Inspection</TableCell>
            <TableCell>Lane ID</TableCell>
            <TableCell>Occupancy ID</TableCell>
            <TableCell>Start Time</TableCell>
            <TableCell>End Time</TableCell>
            <TableCell>Max Gamma Count</TableCell>
            <TableCell>Max Neutron Count</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Adjudicated</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow
            key={eventData.id}
            sx={{ '&:last-child td, &:last-child th': { border: 0, textAlign: "center" } }}
          >
            <TableCell align="center">
              {eventData.secondaryInspection ? (
                <CheckRoundedIcon />
              ): (
                <CloseRoundedIcon />
              )}
            </TableCell>
            <TableCell>{eventData.laneId}</TableCell>
            <TableCell>{eventData.occupancyId}</TableCell>
            <TableCell>{eventData.startTime}</TableCell>
            <TableCell>{eventData.endTime}</TableCell>
            <TableCell>{eventData.maxGamma}</TableCell>
            <TableCell>{eventData.maxNeutron}</TableCell>
            <StatusTableCell status={eventData.status}>{eventData.status}</StatusTableCell>
            <TableCell>{'kalyn'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
