import React from 'react';
import styled from '@xstyled/styled-components';
import { borderRadius, grid } from './constants';
import { Divider, Stack } from '@mui/material';
import {Avatar} from '@mui/material';
import {Apps} from '@material-ui/icons';
import {Web} from '@material-ui/icons';
import { useSelector } from 'react-redux';
const getBackgroundColor = (isDragging, isGroupedOver, authorColors) => {
  if (isDragging) {
    return '#b7b7b7';
  }

  if (isGroupedOver) {
    return '#EBECF0';
  }

  return '#1f1f1f';
};

const getBorderColor = (isDragging, authorColors) =>
  isDragging ? 'blue' : 'transparent';

const imageSize = 10;

const CloneBadge = styled.div`
  background: #79f2c0;
  bottom: ${grid / 2}px;
  border: 2px solid #57d9a3;
  border-radius: 50%;
  box-sizing: border-box;
  font-size: 10px;
  position: absolute;
  right: -${imageSize / 3}px;
  top: -${imageSize / 3}px;
  transform: rotate(40deg);
  height: ${imageSize}px;
  width: ${imageSize}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.a`
  border-radius: ${borderRadius}px;
  border: 2px solid transparent;
  border-color: ${(props) => getBorderColor(props.isDragging, props.colors)};
  background-color: ${(props) =>
    getBackgroundColor(props.isDragging, props.isGroupedOver, props.colors)};
  box-shadow: ${({ isDragging }) => (isDragging ? `2px 2px 1px #A5ADBA` : 'none')};
  box-sizing: border-box;
  padding: ${grid}px;
  min-height: ${imageSize}px;
  margin-bottom: ${grid}px;
  user-select: none;

  /* anchor overrides */
  color: #091e42;

  &:hover,
  &:active {
    color: #091e42;
    text-decoration: none;
  }

  &:focus {
    outline: none;
    border-color: black;
    box-shadow: none;
  }

  /* flexbox */
  display: flex;
`;

// const Avatar = styled.img`
//   width: ${imageSize}px;
//   height: ${imageSize}px;
//   border-radius: 50%;
//   margin-right: ${grid}px;
//   flex-shrink: 0;
//   flex-grow: 0;
// `;

const Content = styled.div`
  /* flex child */
  flex-grow: 1;
  /*
    Needed to wrap text in ie11
    webs://stackoverflow.com/questions/35111090/why-ie11-doesnt-wrap-the-text-in-flexbox
  */
  flex-basis: 100%;
  /* flex parent */
  display: flex;
  flex-direction: column;
`;

const BlockQuote = styled.div`
  &::before {
    content: open-quote;
  }
  &::after {
    content: close-quote;
  }
`;

const Footer = styled.div`
  display: flex;
  margin-top: ${grid}px;
  align-items: center;
`;

const Author = styled.small`
  color: #fff;
  flex-grow: 0;
  margin: 0;
  background-color: ${(props) => props.colors.soft};
  border-radius: ${borderRadius}px;
  font-weight: normal;
  padding: ${grid / 2}px;
`;

const QuoteId = styled.small`
  flex-grow: 1;
  flex-shrink: 1;
  margin: 0;
  font-weight: normal;
  text-overflow: ellipsis;
  text-align: right;
`;



// Previously this extended React.Component
// That was a good thing, because using React.PureComponent can hide
// issues with the selectors. However, moving it over does can considerable
// performance improvements when reordering big lists (400ms => 200ms)
// Need to be super sure we are not relying on PureComponent here for
// things we should be doing in the selector as we do not know if consumers
// will be using PureComponent
function QuoteItem(props) {
  const { app, isDragging, isGroupedOver, provided, style, isClone, index } = props;
    // console.log(app)
    var filterApps = useSelector(state => state.app.filterApps);
    const checkFilter = (name) => {
        if (filterApps[name] === undefined) {
            return true;
        }
        return filterApps[name]['app_name'] && filterApps[name]['app_type'] && filterApps[name]['distracting'];
    }
    function getStyle(provided, style) {
      if (!style) {
        return provided.draggableProps.style;
      }
    
      return {
        ...provided.draggableProps.style,
        ...style,
      };
    }

  return (
    
    <Container
    //   href={quote.author.url}
      isDragging={isDragging}
      isGroupedOver={isGroupedOver}
      isClone={isClone}
    
    //   colors={quote.author.colors}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{ ...getStyle(provided, style,app.name) ,height: checkFilter(app.name) ? null : '0%'}}
      data-is-dragging={isDragging}
      data-testid={app.name}
      data-index={index}
      aria-label={`${app.name}`}
    >{checkFilter(app.name) ?
      <>
        
            
        
      {/* <Content> */}
        {/* <BlockQuote>{quote.content}</BlockQuote> */}
        <Stack direction='row' style={{alignItems:'center'}}>
        {app.icon ? <Avatar sizes={256} style={{color:'white'}} src={'http://127.0.0.1:5005/images?path='+app.icon} />: app.type === 'website' ? <Web lg={{ fontSize: 80 }} style={{fontSize: 40,color:'white'}}/>: <Apps style={{color:'white',fontSize: 40}}/> }
        <Divider orientation='vertical' style={{height:'100%',margin:'0 8px'}}/>
        <h3 style={{color: isDragging?'black':'white'}}>{app.name}</h3>
        </Stack>
        {/* <Divider/> */}
        {/* <h3>{app.type}</h3> */}
        {/* <Footer>
          <Author colors={quote.author.colors}>{quote.author.name}</Author>
          <QuoteId>
            id:
            {quote.id}
          </QuoteId>
        </Footer> */}
      {/* </Content> */}
      </>
      : <></>
      }
    </Container>
  );
}

export default React.memo(QuoteItem);
