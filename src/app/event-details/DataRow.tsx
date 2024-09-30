"use client";

import { IEventTableData, SelectedEvent } from "types/new-types";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import {useSelector} from "react-redux";
import {selectEventPreview} from "@/lib/state/OSCARClientSlice";


export default function DataRow() {
  const eventPreview = useSelector(selectEventPreview);
  const eventData: IEventTableData = eventPreview.eventData;

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Secondary Inspection</TableCell>
            <TableCell>Lane ID</TableCell>
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
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell align="center">
              {eventData.secondaryInspection ? (
                <CheckRoundedIcon />
              ): (
                <CloseRoundedIcon />
              )}
            </TableCell>
            <TableCell>{eventData.laneId}</TableCell>
            <TableCell>{eventData.startTime}</TableCell>
            <TableCell>{eventData.endTime}</TableCell>
            <TableCell>{eventData.maxGamma}</TableCell>
            <TableCell>{eventData.maxNeutron}</TableCell>
            <TableCell>{eventData.status}</TableCell>
            {/** Adjudicated needs to be adjusted and styled when user details are figured out */}
            <TableCell>{eventData.adjudicatedUser}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
