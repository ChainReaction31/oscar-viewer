"use client";

import { IEventTableData, SelectedEventOcc } from "types/new-types";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import {styled} from "@mui/material/styles";

const testData: IEventTableData = {
  id: 1,
  secondaryInspection: false,
  laneId: '1', occupancyId: '1',
  startTime: 'XX:XX:XX AM',
  endTime: 'XX:XX:XX AM',
  maxGamma: 25642,
  maxNeutron: 0,
  status: 'Gamma',
  adjudicatedUser: "None",
  adjudicatedCode: 0,
}
const StatusTableCell = styled(TableCell)(({theme, status }: {theme: any, status: string }) => ({
  color: status === 'Gamma' ? theme.palette.error.contrastText : status === 'Neutron' ? theme.palette.info.contrastText : status === 'Gamma & Neutron' ? theme.palette.secondary.contrastText : 'inherit',
  backgroundColor: status === 'Gamma' ? theme.palette.error.main : status === 'Neutron' ? theme.palette.info.main : status === 'Gamma & Neutron' ? theme.palette.secondary.main : 'transparent',
}));


export default function DataRow(props: {
  event: SelectedEventOcc;
}) {

  console.log('props', props.event)
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
            // key={props.event.id}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            <TableCell align="center">
              {testData.secondaryInspection ? (
                <CheckRoundedIcon />
              ): (
                <CloseRoundedIcon />
              )}
            </TableCell>
            <TableCell>{props.event.laneId}</TableCell>
            <TableCell>{props.event.startTime}</TableCell>
            <TableCell>{props.event.endTime}</TableCell>
            <TableCell>{props.event.maxGamma}</TableCell>
            <TableCell>{props.event.maxNeutron}</TableCell>
            <StatusTableCell status={props.event.status}>{props.event.status}</StatusTableCell>
            <TableCell>{'kalyn'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
