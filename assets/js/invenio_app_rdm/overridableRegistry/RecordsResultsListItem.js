import { i18next } from "@translations/invenio_app_rdm/i18next";
import _get from "lodash/get";
import _truncate from "lodash/truncate";
import React, { useState, useEffect } from "react";
import { Item, Label, Icon, Button } from "semantic-ui-react";
import { CompactStats } from "@js/invenio_app_rdm/components/CompactStats";
import { DisplayPartOfCommunities } from "@js/invenio_app_rdm/components/DisplayPartOfCommunities";
import { SearchItemCreators } from "@js/invenio_app_rdm/utils";

export default function RecordsResultsListItem(props) {
  const [currentAbstractType, setCurrentAbstractType] = useState('original');
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  
  const uniqueViews = _get(props.result, "stats.all_versions.unique_views", 0);
  const uniqueDownloads = _get(props.result, "stats.all_versions.unique_downloads", 0);
  const publishingInformation = _get(props.result, "ui.publishing_information.journal", "");
  const viewLink = `/records/${props.result.id}`;
  const simpleAbstract = _get(props.result, "custom_fields.summarization:summarization.simple", "");
  const advancedAbstract = _get(props.result, "custom_fields.summarization:summarization.advanced", "");

  const hasSimpleAbstract = simpleAbstract && simpleAbstract.trim();
  const hasAdvancedAbstract = advancedAbstract && advancedAbstract.trim();
  const hasSummaries = hasSimpleAbstract || hasAdvancedAbstract;

  useEffect(() => {
    if (isExpanded) {
      setAnimationClass('animate-in');
    }
  }, [isExpanded]);

  const handleAbstractTypeChange = () => {
    if (currentAbstractType === 'original') {
      if (hasSimpleAbstract) {
        setCurrentAbstractType('simple');
        setIsExpanded(true);
        setAnimationClass('');
        setTimeout(() => setAnimationClass('animate-in'), 10);
      } else if (hasAdvancedAbstract) {
        setCurrentAbstractType('advanced');
        setIsExpanded(true);
        setAnimationClass('');
        setTimeout(() => setAnimationClass('animate-in'), 10);
      }
    } else if (currentAbstractType === 'simple') {
      if (hasAdvancedAbstract) {
        setCurrentAbstractType('advanced');
        setAnimationClass('');
        setTimeout(() => setAnimationClass('animate-in'), 10);
      } else {
        setCurrentAbstractType('original');
        setIsExpanded(false);
        setAnimationClass('');
      }
    } else if (currentAbstractType === 'advanced') {
      setCurrentAbstractType('original');
      setIsExpanded(false);
      setAnimationClass('');
    }
  };

  const getButtonContent = () => {
    if (currentAbstractType === 'original') {
      if (hasSimpleAbstract) {
        return {
          icon: 'lightbulb outline',
          text: 'Simple Abstract Summary'
        };
      } else if (hasAdvancedAbstract) {
        return {
          icon: 'graduation cap',
          text: 'Advanced Abstract Summary'
        };
      }
    } else if (currentAbstractType === 'simple') {
      if (hasAdvancedAbstract) {
        return {
          icon: 'graduation cap',
          text: 'Advanced Abstract Summary'
        };
      } else {
        return {
          icon: 'times',
          text: 'Close'
        };
      }
    } else if (currentAbstractType === 'advanced') {
      return {
        icon: 'times',
        text: 'Close'
      };
    }
    return null;
  };

  const getCurrentAbstractContent = () => {
    switch (currentAbstractType) {
      case 'simple':
        return simpleAbstract;
      case 'advanced':
        return advancedAbstract;
      default:
        return props.descriptionStripped;
    }
  };

  const getAbstractIcon = () => {
    switch (currentAbstractType) {
      case 'simple':
        return 'lightbulb outline';
      case 'advanced':
        return 'graduation cap';
      default:
        return 'file alternate outline';
    }
  };

  const getAbstractTitle = () => {
    switch (currentAbstractType) {
      case 'simple':
        return 'Simple Abstract Summary';
      case 'advanced':
        return 'Advanced Abstract Summary';
      default:
        return 'Original Abstract';
    }
  };

  return (
    <Item key={props.key ?? props.result.id}>
      <Item.Content>
        {/* FIXME: Uncomment to enable themed banner */}
        {/* <DisplayVerifiedCommunity communities={result.parent?.communities} /> */}
        <Item.Extra className="labels-actions">
          <Label horizontal size="small" className="primary">
            {props.publicationDate} ({props.version})
          </Label>
          <Label horizontal size="small" className="neutral">
            {props.resourceType}
          </Label>
          <Label
            horizontal
            size="small"
            className={`access-status ${props.accessStatusId}`}
          >
            {props.accessStatusIcon && <Icon name={props.accessStatusIcon} />}
            {props.accessStatus}
          </Label>
        </Item.Extra>
        <Item.Header as="h2">
          <a href={viewLink}>{props.title}</a>
        </Item.Header>
        <Item className="creatibutors">
          <SearchItemCreators creators={props.creators} othersLink={viewLink} />
        </Item>
        <Item.Description>
          <div style={{ marginBottom: '1rem' }}>
            {_truncate(props.descriptionStripped, { length: 350 })}
          </div>
          
          {hasSummaries && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.3rem', 
              marginBottom: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <Button
                basic
                size="mini"
                color="blue"
                onClick={handleAbstractTypeChange}
                className="abstract-button"
                style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.4em 0.6em',
                  minHeight: 'auto'
                }}
              >
                <Icon name={getButtonContent()?.icon} style={{ fontSize: '0.8rem' }} />
                {getButtonContent()?.text}
              </Button>
            </div>
          )}

          {isExpanded && currentAbstractType !== 'original' && (
            <div
              className={`abstract-summary ${animationClass}`}
              style={{
                background: '#f4f8fb',
                borderRadius: '10px',
                padding: '1.2em 1em',
                marginTop: '0.5em',
                boxShadow: '0 2px 12px rgba(106,130,251,0.07)',
                borderLeft: '4px solid #6a82fb',
                fontStyle: 'italic',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: animationClass === 'animate-in' ? 'translateY(0)' : 'translateY(20px)',
                opacity: animationClass === 'animate-in' ? 1 : 0,
                maxHeight: isExpanded ? '500px' : '0',
                overflow: 'hidden'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                marginBottom: '0.8rem',
                color: '#333',
                fontWeight: '600'
              }}>
                <Icon name={getAbstractIcon()} style={{ color: '#6a82fb' }} />
                <span>{getAbstractTitle()}</span>
                <Icon name="magic" style={{ color: '#6a82fb' }} />
                <span
                  className="ai-generated-badge"
                >
                  AI Generated
                </span>
              </div>
              <div style={{ 
                wordWrap: 'break-word',
                lineHeight: '1.5',
                color: '#555'
              }}>
                <span dangerouslySetInnerHTML={{ __html: getCurrentAbstractContent() }} />
              </div>
            </div>
          )}
        </Item.Description>
        <Item.Extra>
          {props.subjects.map((subject) => (
            <Label key={subject.title_l10n} size="tiny">
              {subject.title_l10n}
            </Label>
          ))}

          <div className="flex justify-space-between align-items-end">
            <small>
              <DisplayPartOfCommunities communities={props.result.parent?.communities} />
              <p>
                {props.createdDate && (
                  <>
                    {i18next.t("Uploaded on {{uploadDate}}", {
                      uploadDate: props.createdDate,
                    })}
                  </>
                )}
                {props.createdDate && publishingInformation && " | "}

                {publishingInformation && (
                  <>
                    {i18next.t("Published in: {{publishInfo}}", {
                      publishInfo: publishingInformation,
                    })}
                  </>
                )}
              </p>

              {!props.allVersionsVisible && props.versions.index > 1 && (
                <p>
                  <b>
                    {i18next.t("{{count}} more versions exist for this record", {
                      count: props.numOtherVersions,
                    })}
                  </b>
                </p>
              )}
            </small>

            <small>
              <CompactStats
                uniqueViews={uniqueViews}
                uniqueDownloads={uniqueDownloads}
              />
            </small>
          </div>
        </Item.Extra>
      </Item.Content>
    </Item>
  )
}
