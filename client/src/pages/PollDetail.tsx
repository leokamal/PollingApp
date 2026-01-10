import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import { GET_POLL, VOTE } from '../queries'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import './PollDetail.css'

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140']

function PollDetail() {
  const { id } = useParams<{ id: string }>()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)

  const { loading, error, data, refetch } = useQuery(GET_POLL, {
    variables: { id },
  })

  const [vote, { loading: voting }] = useMutation(VOTE, {
    onCompleted: () => {
      refetch()
      setSelectedOption(null)
    },
  })

  if (loading) return <div className="loading">Loading poll...</div>
  if (error) return <div className="error">Error: {error.message}</div>
  if (!data?.poll) return <div className="error">Poll not found</div>

  const poll = data.poll

  const handleVote = async () => {
    if (!selectedOption) {
      alert('Please select an option')
      return
    }

    try {
      const result = await vote({
        variables: {
          input: {
            pollId: id,
            optionId: selectedOption,
            isAnonymous,
          },
        },
      })

      if (!result.data?.vote?.success) {
        alert(result.data?.vote?.message || 'Failed to record vote')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to record vote')
    }
  }

  const chartData = poll.results.map((result: any) => ({
    name: result.optionText,
    votes: result.voteCount,
    percentage: result.percentage,
  }))

  return (
    <div className="poll-detail">
      <Link to="/" className="back-link">← Back to polls</Link>

      <div className="poll-detail-card">
        <div className="poll-header">
          <h1>{poll.title}</h1>
          <div className="poll-info">
            <span>
              Created by {poll.isAnonymousCreator ? 'Anonymous' : poll.creatorName || 'Anonymous'}
            </span>
            <span>•</span>
            <span>{poll.voteCount} total votes</span>
            <span>•</span>
            <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {poll.userHasVoted ? (
          <div className="results-section">
            <h2>Results</h2>
            <div className="results-container">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'votes') {
                        const item = chartData.find(d => d.votes === value)
                        return [`${value} votes (${item?.percentage}%)`, 'Votes']
                      }
                      return [value, name]
                    }}
                  />
                  <Bar dataKey="votes" fill="#667eea">
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="results-list">
              {poll.results.map((result: any, index: number) => (
                <div key={result.optionId} className="result-item">
                  <div className="result-header">
                    <span className="result-option">{result.optionText}</span>
                    <span className="result-stats">
                      {result.voteCount} votes ({result.percentage}%)
                    </span>
                  </div>
                  <div className="result-bar-container">
                    <div 
                      className="result-bar"
                      style={{ 
                        width: `${result.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="voting-section">
            <h2>Cast your vote</h2>
            <div className="options-list">
              {poll.options.map((option: any) => (
                <label key={option.id} className="option-radio">
                  <input
                    type="radio"
                    name="option"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>

            <div className="anonymous-voting">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span>Vote anonymously (cannot be traced)</span>
              </label>
            </div>

            <button
              onClick={handleVote}
              disabled={!selectedOption || voting}
              className="btn btn-primary btn-vote"
            >
              {voting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        )}

        {poll.voteCount > 0 && poll.userHasVoted && (
          <div className="results-summary">
            <p>Total votes: {poll.voteCount}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PollDetail

